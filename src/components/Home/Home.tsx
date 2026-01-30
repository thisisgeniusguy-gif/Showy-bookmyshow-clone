import React from 'react';
import './Home.css';
import MovieList from '../MovieList/MovieList';

function Home() {
    const movies = [
            {
                "id": 1,
                "title": "The Silent Voyager",
                "image": "https://m.media-amazon.com/images/M/MV5BZDQ1NTJiNTAtZjc1Yy00YjRmLWFkYTgtM2Y1YTJkZTA3OTk3XkEyXkFqcGc@._V1_FMjpg_UX700_.jpg",
                "genre": "Sci-Fi",
                "year": 2023,
                "rating": 8.1,
                "director": "Elena Petrova",
                "cast": ["Marcus Cole", "Aisha Khan"],
                "bookings": []
            },
            {
                "id": 2,
                "title": "Neon Dreams",
                "image": "https://m.media-amazon.com/images/M/MV5BNWE1YzdjNjItYzE5OS00MzhmLTk3ZmEtYWUyODM4ZjMzODAyXkEyXkFqcGc@._V1_FMjpg_UY6000_.jpg",
                "genre": "Cyberpunk",
                "year": 2024,
                "rating": 7.5,
                "director": "Kenji Tanaka",
                "cast": ["Rei Ayanami", "Leo Silva"],
                "bookings": []
            },
            {
                "id": 3,
                "title": "Echoes of Time",
                "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcN05lUekAs2BEsu4UXvX_hCmV-wEClkH8d-H0xmSB6vAUDai2",
                "genre": "Drama",
                "year": 2022,
                "rating": 9.0,
                "director": "Sarah Jenkins",
                "cast": ["Tom Harris", "Maria Garcia"],
                "bookings": []
            }
        ];
    return (
        

    <div>
            <div className='movie-list'>
                <MovieList  movies={movies} />
            </div>
    </div>
    );
}

export default Home;