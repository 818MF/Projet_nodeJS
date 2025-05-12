const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Movie = require("./model");
const tmdbService = require("./tmdbService");
const auth = require("../user/middleware");
const { publishMessage } = require("../../config/rabbitmq");

// Get all favorite movies
router.get("/", auth, async (req, res) => {
	try {
		const movies = await Movie.find({ user: req.user._id });
		res.json(movies);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Search movies on TMDB
router.get("/search", auth, async (req, res) => {
	try {
		const { query } = req.query;
		if (!query) {
			return res.status(400).json({ message: "Query parameter is required" });
		}
		const movies = await tmdbService.searchMovies(query);
		res.json(movies);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Add movie to favorites
router.post("/", auth, async (req, res) => {
	try {
		const { tmdbId } = req.body;

		// Check if movie already exists in favorites
		const existingMovie = await Movie.findOne({ user: req.user._id, tmdbId });
		if (existingMovie) {
			return res.status(400).json({ message: "Movie already in favorites" });
		}

		// Get movie details from TMDB
		const movieDetails = await tmdbService.getMovieDetails(tmdbId);

		// Create new favorite movie
		const movie = new Movie({
			...movieDetails,
			user: req.user._id,
		});

		await movie.save();

		// Publish notification
		await publishMessage("movie_notifications", {
			type: "movie_added",
			userId: req.user._id,
			movieId: movie._id,
			title: movie.title,
		});

		res.status(201).json(movie);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Update movie (note or rating)
router.put(
	"/:id",
	auth,
	[
		body("personalNote").optional().isString(),
		body("rating").optional().isFloat({ min: 0, max: 10 }),
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const movie = await Movie.findOne({
				_id: req.params.id,
				user: req.user._id,
			});
			if (!movie) {
				return res.status(404).json({ message: "Movie not found" });
			}

			const updates = {};
			if (req.body.personalNote !== undefined)
				updates.personalNote = req.body.personalNote;
			if (req.body.rating !== undefined) updates.rating = req.body.rating;

			Object.assign(movie, updates);
			await movie.save();

			res.json(movie);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	}
);

// Delete movie from favorites
router.delete("/:id", auth, async (req, res) => {
	try {
		const movie = await Movie.findOneAndDelete({
			_id: req.params.id,
			user: req.user._id,
		});
		if (!movie) {
			return res.status(404).json({ message: "Movie not found" });
		}

		// Publish notification
		await publishMessage("movie_notifications", {
			type: "movie_removed",
			userId: req.user._id,
			movieId: movie._id,
			title: movie.title,
		});

		res.json({ message: "Movie removed from favorites" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
