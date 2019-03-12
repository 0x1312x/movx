import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import ModalVideo from 'react-modal-video';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LazyLoad from 'react-lazy-load';

import ImageLoader from '../layout/ImageLoader';
import LoadingScreen from '../layout/LoadingScreen';

// helpers
import { isEmpty } from '../../helpers/helperFunctions';

const tmdb = 'https://api.themoviedb.org/3/';
const tmdbKey = process.env.TMDB_KEY;
const tmdbPosterPath = 'https://image.tmdb.org/t/p/w300_and_h450_face/';
const tmdbBackdropPath = 'https://image.tmdb.org/t/p/w1400_and_h450_face/';

class ViewMovie extends Component {
  state = {
    movie: {},
    loaded: false,
    error: undefined,
    isOpen: false
  };

  componentDidMount() {
    const movieId = this.props.match.params.id;
    const movieCategory = this.props.match.params.category;

    axios.get(`${tmdb + movieCategory}/${movieId}?api_key=${tmdbKey}&append_to_response=videos`)
      .then((response) => {
        const movie = response.data;
        this.setState(() => ({ 
          movie,
          loaded: true,
          error: undefined 
        }));
      })
      .catch((e) => {
        console.log('Cannot fetch movie', e);
        this.setState(() => ({
          loaded: true,
          error: 'Movie details cannot be loaded'
        }));
      });
  }

  openVideoModal = () => {
    if (this.state.movie.videos) this.setState(() => ({ isOpen: true }));
  };

  closeVideoModal = () => {
    this.setState(() => ({ isOpen: false }));
  };
  
  getReleaseYear = (date) => {
    if (date) {
      return date.split('-')[0];
    }
  };

  goPreviousPage = () => {
    this.props.history.goBack();
  };

  render() {
    const { movie, isOpen, loaded, error } = this.state;
    return (
      <React.Fragment>
        {!loaded && <LoadingScreen />}
        {(!isEmpty(movie) && movie.videos.results.length > 1) && (
        <ModalVideo 
            channel='youtube' 
            isOpen={isOpen}
            videoId={movie.videos.results[0].key} 
            onClose={this.closeVideoModal} 
        />
        )}
        <div className="container container__backdrop">
          <div className="container__wrapper container__backdrop-wrapper">
            {(loaded && !isEmpty(movie)) && (
              <React.Fragment>
                <div className="backdrop__container">
                  <img 
                      className="backdrop__image"
                      alt={movie.original_name || movie.original_title}
                      src={`${tmdbBackdropPath + movie.backdrop_path}`} 
                  />
                </div>
                <div className="back__button">
                  <button 
                      className="button--back"
                      onClick={this.goPreviousPage}>
                    Back
                  </button>
                </div>
                <div className="view">
                  <div className="view__poster">
                    <LazyLoad 
                        debounce={false}
                        height={450}
                        offsetVertical={500}
                        width={300}
                      >
                        <ImageLoader 
                            alt={movie.original_title || movie.original_name || movie.title}
                            imgId={movie.id} 
                            src={`${tmdbPosterPath + movie.poster_path}`} 
                        />
                    </LazyLoad>
                  </div>
                  <div className="view__details">
                    <h1 className="view__title">
                      {movie.original_title || movie.original_name}
                      &nbsp;
                      {movie.release_date && (
                        <span>({this.getReleaseYear(movie.release_date)})</span>
                      )}
                    </h1>
                    <p className="view__rating">
                      <FontAwesomeIcon icon={['fa', 'star']} color="yellow" />
                      &nbsp;{movie.vote_average} Rating
                    </p>
                    <h4>Overview</h4>
                    <p>{movie.overview}</p>
                    <button className="button--primary" onClick={this.openVideoModal}>
                      Watch Trailer
                      <FontAwesomeIcon icon={['fa', 'play-circle']} />
                    </button>
                    <button className="button--outlined">
                      Add To Favorites
                      <FontAwesomeIcon icon={['fa', 'heart']} />
                    </button>
                  </div>            
                </div>
              </React.Fragment>
            )}
            {error && (
              <div className="view__not-found">
                <h1>{error}</h1>
                <button 
                    className="button--primary"
                    onClick={this.goPreviousPage}>
                    Go Back
                </button>
              </div>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(ViewMovie);