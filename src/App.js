import { useEffect, useRef, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import "./index.css";
import StarRatings from "./StarRatings.js";

// import { StarRatings } from "./StarRatings";

// const tempMovieData = [
//     {
//         imdbID: "tt1375666",
//         Title: "Inception",
//         Year: "2010",
//         Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     },
//     {
//         imdbID: "tt0133093",
//         Title: "The Matrix",
//         Year: "1999",
//         Poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//     },
//     {
//         imdbID: "tt6751668",
//         Title: "Parasite",
//         Year: "2019",
//         Poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//     },
// ];

// const tempWatchedData = [
//     {
//         imdbID: "tt1375666",
//         Title: "Inception",
//         Year: "2010",
//         Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//         runtime: 148,
//         imdbRating: 8.8,
//         userRating: 10,
//     },
//     {
//         imdbID: "tt0088763",
//         Title: "Back to the Future",
//         Year: "1985",
//         Poster: "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//         runtime: 116,
//         imdbRating: 8.5,
//         userRating: 9,
//     },
// ];

const average = (arr) =>
    arr.reduce((prev, curr, idx, arr) => prev + curr / arr.length, 0);

const KEY = "7b003e19";
// *************************************************************//
//App component
// *************************************************************//
export default function App() {
    const [allMovies, setAllMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [selectedMovieID, setSelectMovieID] = useState("");

    // const [watched, setWatched] = useState([]);
    const [watched, setWatched] = useState(function () {
        const dataStored = localStorage.getItem("watched");
        return JSON.parse(dataStored);
    });

    const averageUserRating = average(watched.map((movie) => movie.userRating));
    const averageimdbRating = average(watched.map((movie) => movie.imdbRating));
    const averageRunTime = average(watched.map((movie) => movie.runtime));

    const totalMoviesWatched = watched.length;

    function handleSelection(id) {
        setSelectMovieID(selectedMovieID !== id ? id : "");
    }

    function handleCloseSection() {
        setSelectMovieID("");
    }

    function handleWatched(movie) {
        setWatched((watched) => [...watched, movie]);
        setSelectMovieID("");
    }

    //Storing watched movies in the local storage
    useEffect(
        function () {
            localStorage.setItem("watched", JSON.stringify(watched));
        },
        [watched]
    );

    useEffect(
        function () {
            const controller = new AbortController();

            async function fetchData() {
                try {
                    setIsLoading(true);

                    //reset the error before fetching the data to allow synchronization of the query state
                    setError("");

                    const response = await fetch(
                        `http://www.omdbapi.com/?apikey=${KEY}&s=${query.toLocaleUpperCase()}`,
                        { signal: controller.signal }
                    );

                    //Handle network loss errors
                    if (!response.ok)
                        throw new Error("Opps!! something went wrong 😔😔");

                    const data = await response.json();

                    // console.log(data1);
                    // console.log(data);
                    //Handle empty data response/ no movies found
                    if (data.Response === "False")
                        throw new Error("Movie not found");

                    setAllMovies(data.Search);
                } catch (err) {
                    if (err.name !== "AbortError") setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            }

            //if there is no query or the query is less than three characters the fetch data will not be called
            if (query.length < 3) {
                setAllMovies([]);
                setError("");
                return;
            }

            fetchData();

            return function () {
                controller.abort();
            };
        },
        [query]
    );

    return (
        <div className="app">
            <Nav>
                <Logo />
                <Search query={query} setQuery={setQuery} />
                <SearchResults allMovies={allMovies} />
            </Nav>

            <Main>
                <Box>
                    {isLoading && <Loader />}
                    {!isLoading && !error && (
                        <MoviesList
                            allMovies={allMovies}
                            onSelect={handleSelection}
                        />
                    )}
                    {error && <ErrorMessage message={error} />}
                </Box>

                <Box
                    className="box-statistics"
                    buttonNum={2}
                    oncloseSelected={handleCloseSection}
                >
                    {selectedMovieID ? (
                        <SelectedMovie
                            selectedMovieID={selectedMovieID}
                            onWatched={handleWatched}
                            watched={watched}
                            onClose={handleCloseSection}
                        />
                    ) : (
                        <>
                            <Stats
                                totalMoviesWatched={totalMoviesWatched.toFixed(
                                    1
                                )}
                                avgUserRating={averageUserRating.toFixed(1)}
                                avgImdbRating={averageimdbRating.toFixed(1)}
                                avgRunTime={averageRunTime.toFixed(1)}
                            />
                            <WatchedList
                                watched={watched}
                                setWatched={setWatched}
                            />
                        </>
                    )}
                </Box>
                {/* <WatchList /> */}
            </Main>

            {/* <Footer/>      */}
        </div>
    );
}

// *************************************************************//
//Navbar component
// *************************************************************//
function Nav({ children }) {
    return <nav className="nav">{children}</nav>;
}

///////////--Serch bar component--////////////
function Search({ query, setQuery }) {
    const inputRef = useRef(null);

    //Using ref to add a focus funtionality to our search bar - DOM manipulation
    useEffect(
        function () {
            function callBack(e) {
                if (document.activeElement === inputRef.current) return;
                if (e.code === "Enter") inputRef.current.focus();
                setQuery("");
            }
            document.addEventListener("keydown", callBack);
            return () => document.removeEventListener("keydown", callBack);
        },
        [setQuery]
    );

    return (
        <div>
            <input
                ref={inputRef}
                value={query}
                type="text"
                placeholder="Search movie by name..."
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    );
}

///////////--Logo component--////////////
function Logo() {
    return (
        <div className="logo">
            <p>🍿</p>
            <p>MOVIE-MASTER</p>
        </div>
    );
}

///////////--Search results component--/////////////
function SearchResults({ allMovies }) {
    const [result, setResult] = useState(0);

    useEffect(
        function () {
            // !query ? setResult(0) : setResult(allMovies.length);
            setResult(allMovies.length);
        },
        [allMovies]
    );
    return (
        <div className="nav-result">
            <p>Found {result} results</p>
        </div>
    );
}

// *************************************************************//
//Main body component
// *************************************************************//
function Main({ children }) {
    return <div className="main-box">{children}</div>;
}

///////////--Reusable box component--/////////////
function Box({ children, className = "", buttonNum = 1, oncloseSelected }) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className={`box ${className}`}>
            {buttonNum > 1 ? (
                <>
                    <button
                        className="collapse-btn"
                        onClick={() => setIsOpen((open) => !open)}
                    >
                        {isOpen ? "-" : "+"}
                    </button>
                    <button
                        className="collapse-btn close-btn"
                        onClick={oncloseSelected}
                    >
                        &#8592;
                    </button>
                </>
            ) : (
                <button
                    className="collapse-btn"
                    onClick={() => setIsOpen((open) => !open)}
                >
                    {isOpen ? "-" : "+"}
                </button>
            )}
            {isOpen && children}
        </div>
    );
}

///////////--Loader component--/////////////
function Loader() {
    return (
        <RotatingLines
            strokeColor="grey"
            strokeWidth="5"
            animationDuration="0.75"
            width="48"
            visible={true}
        />
    );
}

///////////--Error component--/////////////
function ErrorMessage({ message }) {
    return (
        <p style={{ textAlign: "center", fontSize: "16px" }}>🛑 {message}</p>
    );
}

///////////--Movies list component--/////////////
function MoviesList({ allMovies, onSelect }) {
    return (
        <ul className={`movie-list`}>
            {allMovies.map((movie) => (
                <MovieItem
                    movie={movie}
                    key={movie.imdbID}
                    onSelect={onSelect}
                />
            ))}
        </ul>
    );
}

function WatchedList({ watched, setWatched }) {
    return (
        <ul className={`movie-list`}>
            {watched.map((movie) => (
                <MoviesWatched
                    movie={movie}
                    key={movie.imdbID}
                    watched={watched}
                    setWatched={setWatched}
                />
            ))}
        </ul>
    );
}

///////////--Movie item component--/////////////
function MovieItem({ movie, onSelect }) {
    return (
        <li className="movie-item" onClick={() => onSelect(movie.imdbID)}>
            <img
                src={movie.Poster}
                alt={movie.Title}
                className="movie-poster"
            />
            <div className="movie-data">
                <h3>{movie.Title}</h3>
                <p>
                    <span>📅</span>
                    {movie.Year}
                </p>
            </div>
        </li>
    );
}

///////////--statistics component--/////////////
function Stats({
    totalMoviesWatched,
    avgUserRating,
    avgImdbRating,
    avgRunTime,
}) {
    return (
        <div className="stats-box">
            <h2>MOVIES YOU WATCHED</h2>
            <div className="stats">
                <p className="stat">
                    <span>🎦</span>
                    {totalMoviesWatched} Movies
                </p>
                <p className="stat">
                    <span>⭐</span>
                    {avgUserRating}
                </p>
                <p className="stat">
                    <span>⭐</span>
                    {avgImdbRating}
                </p>
                <p className="stat">{avgRunTime} min</p>
            </div>
        </div>
    );
}

///////////--Movies watched--/////////////
function MoviesWatched({ movie, setWatched, watched }) {
    function handleRemove() {
        if (watched.length === 0) return;
        const watchlist = watched;
        const newWatchlist = watchlist.filter(
            (item) => item.imdbID !== movie.imdbID
        );

        setWatched(newWatchlist);
    }

    return (
        <li className="movie-item movie-watched">
            <img
                src={movie.Poster}
                alt={movie.Title}
                className="movie-poster"
            />
            <div className="movie-data movies">
                <h3>{movie.Title}</h3>
                <div className="stats">
                    <p className="stat">
                        <span>⭐</span>
                        {movie.userRating}
                    </p>
                    <p className="stat">
                        <span>⭐</span>
                        {movie.imdbRating}
                    </p>
                    <p className="stat">
                        <span>⏳</span>
                        {movie.runtime} min
                    </p>
                </div>
            </div>
            <button className="remove-movie" onClick={handleRemove}>
                X
            </button>
        </li>
    );
}

///////////--Displaying movie datta of the clicked movie--/////////////
function SelectedMovie({ selectedMovieID, onWatched, watched, onClose }) {
    const [selectmovie, setSelectMovie] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [rating, setRating] = useState(0);

    // const isWatched = watched.some((movie) => movie.imdbID === selectedMovieID);
    const isWatched = watched
        .map((movie) => movie.imdbID)
        .includes(selectedMovieID);

    const watchedUserRating = watched.find(
        (movie) => movie.imdbID === selectedMovieID
    )?.userRating;

    useEffect(
        function () {
            async function fetchSelection() {
                setIsLoading(true);
                const fetchSelected = await fetch(
                    `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedMovieID}`
                );
                const data1 = await fetchSelected.json();
                setSelectMovie(data1);
                setIsLoading(false);
            }
            fetchSelection();
        },
        [selectedMovieID]
    );

    //Changing title page name dynamically
    useEffect(
        function () {
            document.title = `Movie | ${selectmovie.Title}`;
            //cleanup function
            return function () {
                document.title = "Movie-Master";
            };
        },
        [selectmovie]
    );

    //Adding escape keypress eventlistener
    useEffect(
        function () {
            function keyDown(e) {
                if (e.code === "Escape") {
                    onClose();
                }
            }
            document.addEventListener("keydown", keyDown);

            return function () {
                document.removeEventListener("keydown", keyDown);
            };
        },
        [onClose]
    );

    function handleAdd() {
        const movie = {
            Poster: selectmovie.Poster,
            Title: selectmovie.Title,
            imdbRating: selectmovie.imdbRating,
            runtime: selectmovie.Runtime.split(" ").at(0),
            userRating: Number(rating),
            imdbID: selectmovie.imdbID,
        };
        onWatched(movie);
    }

    // console.log(selectmovie);
    return (
        <>
            {isLoading && <Loader />}
            {!isLoading && (
                <div className="selected-container">
                    <div className="selected-header">
                        <img
                            src={selectmovie.Poster}
                            alt="movie poster"
                            className="selected-poster"
                        />
                        <div className="selected-header__data">
                            <h2>{selectmovie.Title}</h2>
                            <p>
                                {selectmovie.Released}&nbsp;.&nbsp;
                                {selectmovie.Runtime}
                            </p>
                            <p>{selectmovie.Genre}</p>
                            <p>
                                ⭐ {selectmovie.imdbRating} &nbsp; IMDb ratings
                            </p>
                        </div>
                    </div>
                    <div className="selected-body__data">
                        <div className="rating-box">
                            {isWatched ? (
                                `You rated this movie ${watchedUserRating} ⭐`
                            ) : (
                                <>
                                    <StarRatings
                                        maxRatings={10}
                                        sizeWidth={24}
                                        sizeHeight={24}
                                        className="starbox"
                                        onWatched={onWatched}
                                        defaultRating={3}
                                        rating={rating}
                                        setRating={setRating}
                                    />
                                    <button
                                        className="btn__add-movie"
                                        onClick={handleAdd}
                                    >
                                        + Add to watchlist
                                    </button>
                                </>
                            )}
                        </div>
                        <p>
                            <em>{selectmovie.Plot}</em>
                        </p>
                        <p>Earnings: {selectmovie.BoxOffice}</p>
                        <p>Starring {selectmovie.Actors}</p>
                        <p>Directed by {selectmovie.Director}</p>
                    </div>
                </div>
            )}
        </>
    );
}

// function Footer() {
//     const today = new Date();
//     const year = today.getFullYear();
//     return (
//         <footer className="footer">
//             <p>&copy;Copyright {year}. Developed by Kevin Njogu</p>
//         </footer>
//     );
// }
