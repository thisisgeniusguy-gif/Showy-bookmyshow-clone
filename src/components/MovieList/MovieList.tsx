import { useNavigate } from "react-router-dom";
import './MovieList.css';

function MovieList({ movies }: { movies: Array<any> }) {
    // 1. Initialize the navigate hook
    const navigate = useNavigate();

    const handleClick = (movie: any) => {
        // 2. Navigate to the booking route and pass the movie data via 'state'
        // This matches the path='/booking/:id' in your App.js
        navigate(`/booking/${movie.id}`, { state: { movie } });
    };

    return (
        <div className="movie-component">
            <h2>Available Shows</h2>
            <div className="movie-count">Total Shows: {movies.length}</div>
            
            <div className="movie-grid"> 
                {movies.map((movie: any) => (
                    <div 
                        key={movie.id} 
                        className="MovieContainer" 
                        onClick={() => handleClick(movie)}
                        style={{ cursor: 'pointer' }}
                    >
                        <h2>Book Tickets for {movie.title}</h2>
                        <div className="movie-image">
                            <img src={movie.image} alt={movie.title} />
                        </div>
                        <div className="movie-details">
                            <p><strong>Genre:</strong> {movie.genre}</p>
                            <p><strong>Rating:</strong> {movie.rating}</p>
                            <p><strong>Director:</strong> {movie.director}</p>
                            <p><strong>Cast:</strong> {movie.cast.join(', ')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MovieList;