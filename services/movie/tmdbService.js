const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbService = {
  async searchMovies(query) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query
        }
      });
      return response.data.results;
    } catch (error) {
      throw new Error('Failed to search movies from TMDB');
    }
  },

  async getMovieDetails(tmdbId) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
        params: {
          api_key: TMDB_API_KEY
        }
      });
      
      return {
        tmdbId: response.data.id,
        title: response.data.title,
        posterPath: response.data.poster_path,
        description: response.data.overview,
        releaseYear: new Date(response.data.release_date).getFullYear()
      };
    } catch (error) {
      throw new Error('Failed to get movie details from TMDB');
    }
  }
};

module.exports = tmdbService; 