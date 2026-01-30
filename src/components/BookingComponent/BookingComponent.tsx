import { useEffect, useState } from "react";
import Popup from 'reactjs-popup';
import { Link, useLocation, useNavigate } from "react-router-dom"; // Use react-router-dom
import './BookingComponent.css';

function BookingComponent() {
    const location = useLocation();
    const navigate = useNavigate();
    const SEATROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const SEATperROW = 20;
    const movie = location.state?.movie; // Get movie from router state


    const [movieSelectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [ticketCount, setTicketCount] = useState(0);
    const [inputValue, setInputValue] = useState("");

    const [alreadyBookedSeats, setAlreadyBookedSeats] = useState<string[]>([]); // track the already booked seats

    // Guard clause: Prevent "reading title of null"
    if (!movie) {
        return (
            <div className="booking-container error-state">
                <h2>No Movie Selected</h2>
                <Link to="/" className="back-button">Back to Home</Link>
            </div>
        );
    }

    useEffect(() => {
        if (movie) {
            const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
            // Find all seats booked for this specific movie ID
            const bookedForThisMovie = history
                .filter((booking: any) => booking.movieId === movie.id)
                .flatMap((booking: any) => booking.seats);

            setAlreadyBookedSeats(bookedForThisMovie);
        }
    }, [movie]);

    useEffect(() => {
        // Fetch all history
        const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');

        // Filter history for only THIS movie's ID
        const bookedForThisMovie = history
            .filter((b: any) => b.movieId === movie.id)
            .flatMap((b: any) => b.seats);

        setAlreadyBookedSeats(bookedForThisMovie);
    }, [movie.id]);
    useEffect(() => {
        console.log("Already booked seats updated:", alreadyBookedSeats);
        console.log("Currently selected seats:", movieSelectedSeats);
    }, [alreadyBookedSeats,movieSelectedSeats]);

    const autoSelectSeats = (seatId: string, count: number) => {
        let CurRow = seatId.charAt(0);
        const CurrSeat = parseInt(seatId.slice(1));
        const allAvailable: string[] = [];
        console.log("Auto-selecting seats...",seatId);
        console.log("selection length:",count - movieSelectedSeats.length);

        // 1. Flatten all available seats into one simple list
        for (let i = CurrSeat; i <= SEATperROW; i++) {
            const seatId = `${CurRow}${i}`;
            if (!alreadyBookedSeats.includes(seatId)) {
                allAvailable.push(seatId);
            }   
        }

        // 2. Take the first 'N' seats from that list
        const selection = allAvailable.slice(0, ( count - movieSelectedSeats.length ));
        console.log("Auto-selected seats:",selection);
        console.log("Selected seats seats count:", movieSelectedSeats);

        if (movieSelectedSeats.length < ticketCount) {
            setSelectedSeats(prev => [...prev, ...selection]);
        } else {
            alert("Not enough seats available!");
        }
    };

    // Toggle seat selection using React state instead of DOM manipulation
    const toggleSeat = (seatId: string) => {
        const isAlreadySelected = movieSelectedSeats.includes(seatId);

        if (isAlreadySelected) {
            // Remove if already there
            setSelectedSeats(prev => prev.filter(id => id !== seatId));
        } else if (movieSelectedSeats.length < ticketCount) {
            // Add only if we haven't reached the limit
            autoSelectSeats(seatId,ticketCount);
        } else {
            alert(`Limit reached: ${ticketCount} tickets.`);
        }
    };

    const handleConfirmBooking = (selectedSeats: string[]) => {
        // 1. Create the booking object
        const newBooking = {
            movieId: movie.id,
            movieTitle: movie.title,
            seats: selectedSeats,
            timestamp: new Date().toISOString(),
        };

        // 2. Get existing history from LocalStorage
        const existingHistory = JSON.parse(localStorage.getItem("bookingHistory") || "[]");

        // 3. Save new booking into the array
        const updatedHistory = [...existingHistory, newBooking];
        localStorage.setItem("bookingHistory", JSON.stringify(updatedHistory));

        // 4. Update the "Greyed Out" state so the UI reflects the booking immediately
        setAlreadyBookedSeats([...alreadyBookedSeats, ...selectedSeats]);

        // 5. Success Feedback
        alert(`Success! You have booked seats: ${selectedSeats.join(", ")}`);

        // 6. Reset current selection
        setSelectedSeats([]);
        navigate("/");
    };

    const renderSeats = (row: string, count: number = SEATperROW) => (
        <div className="seat-row" key={row}>
            <span className="row-label">{row}</span>
            {[...Array(count)].map((_, index) => {
                const seatId = `${row}${index + 1}`;
                const isBooked = alreadyBookedSeats.includes(seatId);
                const isSelected = movieSelectedSeats.includes(seatId);

                return (
                    <div key={index} className="seat-wrapper">
                        {/* Add an aisle after the 5th seat (index 5) */}
                        {index% 5 === 0 && index > 0 && <div className="aisle"></div>}

                        <div className={`seat ${isBooked ? 'booked' : ''}`}>
                            <input
                                type="checkbox"
                                id={seatId}
                                disabled={isBooked}
                                checked={isSelected}
                                onChange={() => toggleSeat(seatId)}
                            />
                            <label htmlFor={seatId}>{index + 1}</label>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const handleConfirmSeats = (close: () => void) => {
        const tickets = parseInt(inputValue);
        if (tickets > 0 && tickets <= 10) {
            setTicketCount(tickets);
        
            close();
        } else {
            alert("Please enter a valid number between 1 and 10");
        }
    };

    return (
        <div className="booking-container">
            <Link to="/" className="back-button">← Back to Movies</Link>
                
            <div className="booking-component">
                <h2>Booking: {movie.title}</h2>
                <div className="movie-summary">
                    <p><strong>Genre:</strong> {movie.genre} | <strong>Rating:</strong> {movie.rating}</p>
                </div>

                <h3>Seats Selected: {movieSelectedSeats.length} / {ticketCount}</h3>

                <Popup
                    trigger={<button className="ticket-trigger">Change Ticket Count</button>}
                    modal
                    nested
                    defaultOpen={true}
                    closeOnDocumentClick={false}
                >
                    {(close: any) => (
                        <div className='modal'>
                            <button className='close' onClick={close}>&times;</button>
                            <div className="header">Select Number of Tickets</div>
                            <div className="content">
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="1-10"
                                />
                            </div>
                            <div className="actions">
                                <button className='confirm' onClick={() => handleConfirmSeats(close)}>
                                    Confirm
                                </button>
                            </div>
                        </div>
                    )}
                </Popup>

                <div className="booking-actions">
                    <div className="SeatSelectionLayout">
                        <div className="screen">SCREEN THIS SIDE</div>
                        {SEATROWS.map(row => renderSeats(row))}
                    </div>

                    {ticketCount > 0 && ticketCount === movieSelectedSeats.length && (
                        <button
                            className="book-now-btn"
                            disabled={movieSelectedSeats.length !== ticketCount}
                            onClick={() => handleConfirmBooking(movieSelectedSeats)}
                        >
                            Book {movieSelectedSeats.length} Tickets
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BookingComponent;