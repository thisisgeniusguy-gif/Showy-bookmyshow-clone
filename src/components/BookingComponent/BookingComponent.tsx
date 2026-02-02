import { useEffect, useState } from "react";
import Popup from 'reactjs-popup';
import { Link, useLocation, useNavigate } from "react-router-dom";
import './BookingComponent.css';

interface SeatSelection {
    row: string;
    aisle: number;
    seats: string[];
}

function BookingComponent() {
    const location = useLocation();
    const navigate = useNavigate();
    const SEATROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const SEATperROW = 20;
    const movie = location.state?.movie;

    const [movieSelectedSeats, setSelectedSeats] = useState<SeatSelection[]>([]);
    const [ticketCount, setTicketCount] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const [alreadyBookedSeats, setAlreadyBookedSeats] = useState<string[]>([]);

    // Helper: Get all selected seat IDs from 2D array
    const getAllSelectedSeatIds = (): string[] => {
        return movieSelectedSeats.flatMap(selection => selection.seats);
    };

    // Helper: Add seats to the 2D structure
    const addSeatsToSelection = (row: string, aisle: number, newSeats: string[]) => {
        setSelectedSeats(prev => {
            const existingIndex = prev.findIndex(
                item => item.row === row && item.aisle === aisle
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    seats: [...new Set([...updated[existingIndex].seats, ...newSeats])]
                };
                return updated;
            } else {
                return [...prev, { row, aisle, seats: newSeats }];
            }
        });
    };

    // Helper: Remove a seat from the 2D structure
    const removeSeatFromSelection = (seatId: string) => {
        setSelectedSeats(prev => {
            return prev
                .map(selection => ({
                    ...selection,
                    seats: selection.seats.filter(id => id !== seatId)
                }))
                .filter(selection => selection.seats.length > 0);
        });
    };

    // Helper: Clear all selections
    const clearAllSelections = () => {
        setSelectedSeats([]);
    };

    // Helper: Get available seat count in an aisle
    const getAvailableSeatsInAisle = (row: string, aisleNumber: number, excludeSeats: string[] = []): number => {
        const aisleStart = (aisleNumber - 1) * 5 + 1;
        const aisleEnd = Math.min(aisleNumber * 5, SEATperROW);
        let count = 0;

        for (let i = aisleStart; i <= aisleEnd; i++) {
            const seatId = `${row}${i}`;
            const seatElement = document.getElementById(seatId);
            const isAvailable = seatElement &&
                !alreadyBookedSeats.includes(seatId) &&
                !excludeSeats.includes(seatId);
            
            if (isAvailable) count++;
        }

        return count;
    };

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
            const bookedForThisMovie = history
                .filter((booking: any) => booking.movieId === movie.id)
                .flatMap((booking: any) => booking.seats);

            setAlreadyBookedSeats(bookedForThisMovie);
        }
    }, [movie]);

    useEffect(() => {
        console.log("2D Selected seats structure:", movieSelectedSeats);
        console.log("Flattened selected seats:", getAllSelectedSeatIds());
    }, [movieSelectedSeats]);

    /**
     * Auto-select seats with smart selection logic
     * @param seatId - Clicked seat ID
     * @param count - Total tickets needed
     * @param shouldClearExisting - Whether to clear existing selections before selecting
     */
    const autoSelectSeats = (seatId: string, count: number, shouldClearExisting: boolean = false) => {
    const row = seatId.charAt(0);
    const seatNumber = parseInt(seatId.slice(1));
    const currentAisle = Math.ceil(seatNumber / 5);
    const aisleStart = (currentAisle - 1) * 5 + 1;
    const aisleEnd = Math.min(currentAisle * 5, SEATperROW);

    // Clear existing selections if requested AND conditions are met
    if (shouldClearExisting) {
      clearAllSelections();
        
    }

    // Calculate seats needed
    const currentSelectedIds = shouldClearExisting ? [] : getAllSelectedSeatIds();
    const seatsNeeded = count - currentSelectedIds.length;

    if (seatsNeeded <= 0) {
        console.log("No more seats needed");
        return;
    }

    // Helper: Check if a seat is available
    const isSeatAvailable = (seatIdToCheck: string): boolean => {
        const seatElement = document.getElementById(seatIdToCheck);
        return !!(
            seatElement &&
            !alreadyBookedSeats.includes(seatIdToCheck) &&
            !currentSelectedIds.includes(seatIdToCheck)
        );
    };

    // Helper: Get consecutive seats in a direction
    const getConsecutiveSeats = (start: number, end: number, increment: number): string[] => {
        const seats: string[] = [];
        let current = start;

        while ((increment > 0 ? current <= end : current >= end) && seats.length < seatsNeeded) {
            const currentSeatId = `${row}${current}`;
            
            if (isSeatAvailable(currentSeatId)) {
                if (increment > 0) {
                    seats.push(currentSeatId);
                } else {
                    seats.unshift(currentSeatId);
                }
            } else {
                break; // Stop at first blocked seat
            }
            
            current += increment;
        }

        return seats;
    };

    let selectedSeats: string[] = [];

    // Strategy 1: Forward consecutive from clicked position
    selectedSeats = getConsecutiveSeats(seatNumber, aisleEnd, 1);
    
    if (selectedSeats.length === seatsNeeded) {
        addSeatsToSelection(row, currentAisle, selectedSeats);
        console.log(`✓ Selected ${selectedSeats.length} seats forward:`, selectedSeats);
        return;
    }

    // Strategy 2: Backward consecutive from clicked position
    const backwardSeats = getConsecutiveSeats(seatNumber, aisleStart, -1);
    
    if (backwardSeats.length === seatsNeeded) {
        addSeatsToSelection(row, currentAisle, backwardSeats);
        console.log(`✓ Selected ${backwardSeats.length} seats backward:`, backwardSeats);
        return;
    }

    // Strategy 3: Choose direction with more consecutive seats
    if (backwardSeats.length > selectedSeats.length) {
        selectedSeats = backwardSeats;
        console.log(`Choosing backward (${backwardSeats.length} > ${selectedSeats.length})`);
    } else {
        console.log(`Choosing forward (${selectedSeats.length} >= ${backwardSeats.length})`);
    }

    if (selectedSeats.length === seatsNeeded) {
        addSeatsToSelection(row, currentAisle, selectedSeats);
        return;
    }

    // Strategy 4: Non-consecutive - collect all available in aisle (forward OR backward only)
    if (selectedSeats.length < seatsNeeded) {
        const allAvailableSeats: string[] = [];
        
        // Determine direction based on which had more consecutive seats
        const isBackward = backwardSeats.length > getConsecutiveSeats(seatNumber, aisleEnd, 1).length;
        
        if (isBackward) {
            // Collect backward from clicked position
            for (let i = seatNumber; i >= aisleStart; i--) {
                const currentSeatId = `${row}${i}`;
                if (isSeatAvailable(currentSeatId)) {
                    allAvailableSeats.unshift(currentSeatId);
                }
            }
        } else {
            // Collect forward from clicked position
            for (let i = seatNumber; i <= aisleEnd; i++) {
                const currentSeatId = `${row}${i}`;
                if (isSeatAvailable(currentSeatId)) {
                    allAvailableSeats.push(currentSeatId);
                }
            }
        }

        if (allAvailableSeats.length >= seatsNeeded) {
            selectedSeats = allAvailableSeats.slice(0, seatsNeeded);
        } else {
            selectedSeats = allAvailableSeats;
        }
    }

    // Apply final selection
    if (selectedSeats.length > 0) {
        addSeatsToSelection(row, currentAisle, selectedSeats);
        console.log(`✓ Selected ${selectedSeats.length}/${seatsNeeded} seats:`, selectedSeats);
        
        if (selectedSeats.length < seatsNeeded) {
            console.warn(`⚠ Partial selection: ${seatsNeeded - selectedSeats.length} more seats needed`);
        }
    } else {
        alert('No seats available in this aisle.');
    }
};

    /**
     * Toggle seat selection with smart clearing logic
     */
    const toggleSeat = (seatId: string) => {
        const currentSelectedIds = getAllSelectedSeatIds();
        const isAlreadySelected = currentSelectedIds.includes(seatId);

        // Case 1: Deselect a selected seat
        if (isAlreadySelected) {
            autoSelectSeats(seatId, ticketCount, true)
            return;
        }

        // Case 2: Add more seats (still under limit)
        if (currentSelectedIds.length < ticketCount) {
            autoSelectSeats(seatId, ticketCount, false);
            return;
        }

        // Case 3: Already at limit - decide whether to switch aisles
        const clickedRow = seatId.charAt(0);
        const clickedSeatNumber = parseInt(seatId.slice(1));
        const clickedAisle = Math.ceil(clickedSeatNumber / 5);

        // Get currently selected aisle info
        const currentSelection = movieSelectedSeats[0];
        
        if (!currentSelection) {
            // No current selection, just select
            autoSelectSeats(seatId, ticketCount, true);
            return;
        }

        const currentRow = currentSelection.row;
        const currentAisleNumber = currentSelection.aisle;
        const currentSeatCount = currentSelection.seats.length;

        // Count available seats in clicked aisle
        const availableInClickedAisle = getAvailableSeatsInAisle(clickedRow, clickedAisle);

        // Decision logic: Switch if new aisle has more available seats
        if (availableInClickedAisle > currentSeatCount) {
            console.log(`Switching aisles: Current (${currentRow}-Aisle${currentAisleNumber}) has ${currentSeatCount}, New (${clickedRow}-Aisle${clickedAisle}) has ${availableInClickedAisle} available`);
            
            // Clear and select from new aisle
            autoSelectSeats(seatId, ticketCount, true);
        } else {
            autoSelectSeats(seatId, ticketCount, true);
        }
    };

    const handleConfirmBooking = () => {
        const selectedSeatIds = getAllSelectedSeatIds();

        if (selectedSeatIds.length !== ticketCount) {
            alert(`Please select ${ticketCount} seats before booking.`);
            return;
        }

        const newBooking = {
            movieId: movie.id,
            movieTitle: movie.title,
            seats: selectedSeatIds,
            seatDetails: movieSelectedSeats,
            timestamp: new Date().toISOString(),
        };

        const existingHistory = JSON.parse(localStorage.getItem("bookingHistory") || "[]");
        const updatedHistory = [...existingHistory, newBooking];
        localStorage.setItem("bookingHistory", JSON.stringify(updatedHistory));

        setAlreadyBookedSeats([...alreadyBookedSeats, ...selectedSeatIds]);

        alert(`Success! You have booked seats: ${selectedSeatIds.join(", ")}`);

        setSelectedSeats([]);
        navigate("/");
    };

    const renderSeats = (row: string, count: number = SEATperROW) => {
        const currentSelectedIds = getAllSelectedSeatIds();

        return (
            <div className="seat-row" key={row}>
                <span className="row-label">{row}</span>
                {[...Array(count)].map((_, index) => {
                    const seatId = `${row}${index + 1}`;
                    const isBooked = alreadyBookedSeats.includes(seatId);
                    const isSelected = currentSelectedIds.includes(seatId);
                    const aisleId = Math.ceil((index + 1) / 5);

                    return (
                        <div key={index} className={`seat-wrapper aisle-${aisleId}`}>
                            {index % 5 === 0 && index > 0 && <div className={`aisle`}></div>}

                            <div className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}>
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
    };

    const handleConfirmSeats = (close: () => void) => {
        const tickets = parseInt(inputValue);
        if (tickets > 0 && tickets <= 10) {
            setTicketCount(tickets);
            close();
        } else {
            alert("Please enter a valid number between 1 and 10");
        }
    };

    const currentSelectedCount = getAllSelectedSeatIds().length;

    return (
        <div className="booking-container">
            <Link to="/" className="back-button">← Back to Movies</Link>

            <div className="booking-component">
                <h2>Booking: {movie.title}</h2>
                <div className="movie-summary">
                    <p><strong>Genre:</strong> {movie.genre} | <strong>Rating:</strong> {movie.rating}</p>
                </div>

                <h3>Seats Selected: {currentSelectedCount} / {ticketCount}</h3>

                {/* Display 2D structure */}
                {movieSelectedSeats.length > 0 && (
                    <div className="seat-breakdown">
                        {movieSelectedSeats.map((selection, idx) => (
                            <div key={idx} className="selection-info">
                                <strong>Row {selection.row}, Aisle {selection.aisle}:</strong> 
                                <span className="seat-list">{selection.seats.join(', ')}</span>
                            </div>
                        ))}
                    </div>
                )}

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

                    {ticketCount > 0 && ticketCount === currentSelectedCount && (
                        <button
                            className="book-now-btn"
                            disabled={currentSelectedCount !== ticketCount}
                            onClick={handleConfirmBooking}
                        >
                            Book {currentSelectedCount} Tickets
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BookingComponent;