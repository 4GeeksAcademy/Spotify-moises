import React, { useRef, useState, useEffect } from "react";

const Home = ({
	backgroundColor = "#282828",
	repeat = false,
}) => {
	const audioRef = useRef(null);
	const [currentSongIndex, setCurrentSongIndex] = useState(0);
	const [isRepeating, setIsRepeating] = useState(repeat);
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const [songs, setSongs] = useState([]);
	const [error, setError] = useState(null);
	const [volumeInterval, setVolumeInterval] = useState(null);
	const baseUrl = "https://playground.4geeks.com";

	useEffect(() => {
		const fetchSongs = async () => {
			try {
				const response = await fetch("https://playground.4geeks.com/sound/songs");
				if (!response.ok) {
					throw new Error("Failed to fetch songs");
				}
				const data = await response.json();
				console.log("Songs loaded:", data.songs);
				setSongs(data.songs.map(song => ({
					...song,
					url: `${baseUrl}${song.url}`
				})));
			} catch (error) {
				setError("Error fetching songs: " + error.message);
				console.error("Error fetching songs:", error);
			}
		};

		fetchSongs();
	}, []);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = 0.5;
		}
	}, []);

	const playSong = (index) => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
			setCurrentSongIndex(index);
			audioRef.current.src = songs[index].url;
			audioRef.current.load();
			audioRef.current.oncanplaythrough = () => {
				audioRef.current.play();
				setIsPlaying(true);
			};
		}
	};

	const togglePlayPause = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	const nextSong = () => {
		if (currentSongIndex < songs.length - 1) {
			const nextIndex = currentSongIndex + 1;
			playSong(nextIndex);
		}
	};

	const prevSong = () => {
		if (currentSongIndex > 0) {
			const prevIndex = currentSongIndex - 1;
			playSong(prevIndex);
		}
	};

	const randomSong = () => {
		const randomIndex = Math.floor(Math.random() * songs.length);
		playSong(randomIndex);
	};

	const toggleRepeat = () => setIsRepeating(!isRepeating);

	const adjustVolume = (amount) => {
		if (audioRef.current) {
			let newVolume = Math.min(Math.max(audioRef.current.volume + amount, 0), 1);
			audioRef.current.volume = newVolume;
		}
	};

	const handleVolumeChangeStart = (amount) => {
		const interval = setInterval(() => {
			adjustVolume(amount);
		}, 100);
		setVolumeInterval(interval);
	};

	const handleVolumeChangeStop = () => {
		if (volumeInterval) {
			clearInterval(volumeInterval);
			setVolumeInterval(null);
		}
	};

	const handleVolumeClick = (amount) => {
		adjustVolume(amount);
	};

	useEffect(() => {
		const audio = audioRef.current;

		const handleTimeUpdate = () => {
			if (audio) {
				setProgress((audio.currentTime / audio.duration) * 100 || 0);
			}
		};

		const handleSongEnd = () => {
			nextSong();
		};

		if (audio) {
			audio.addEventListener("timeupdate", handleTimeUpdate);
			audio.addEventListener("ended", handleSongEnd);
			audio.loop = isRepeating;
		}

		return () => {
			if (audio) {
				audio.removeEventListener("timeupdate", handleTimeUpdate);
				audio.removeEventListener("ended", handleSongEnd);
			}
		};
	}, [isRepeating, currentSongIndex]);

	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
	};

	const getDuration = () => {
		return audioRef.current && !isNaN(audioRef.current.duration) ? audioRef.current.duration : 0;
	};

	return (
		<div className="player-container" style={{ backgroundColor }}>
			{error && <div className="error-message">{error}</div>}

			<ul className="song-list">
				{songs.length > 0 ? (
					songs.map((song, index) => (
						<li key={song.id} onClick={() => playSong(index)} className={index === currentSongIndex ? "active" : ""}>
							{index + 1}. {song.name}
						</li>
					))
				) : (
					<li>No songs available</li>
				)}
			</ul>

			<div className="controls-container">
				<div className="controls">
					<button onClick={prevSong}><i className="fa-solid fa-backward"></i></button>
					<button onClick={togglePlayPause}>
						<i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
					</button>
					<button onClick={nextSong}><i className="fa-solid fa-forward"></i></button>

					<button onClick={randomSong}><i className="fa-solid fa-shuffle"></i></button>

					<button onClick={toggleRepeat} className={isRepeating ? "active" : ""}>
						<i className={`fa-solid fa-repeat ${isRepeating ? "active" : ""}`}></i>
					</button>
				</div>

				<button
					className="volume"
					onClick={() => handleVolumeClick(-0.05)}
					onMouseDown={() => handleVolumeChangeStart(-0.1)}
					onMouseUp={handleVolumeChangeStop}
					onMouseOut={handleVolumeChangeStop}
				>
					<i className="fa-solid fa-volume-low"></i>
				</button>
				<button
					className="volume"
					onClick={() => handleVolumeClick(0.05)}
					onMouseDown={() => handleVolumeChangeStart(0.1)}
					onMouseUp={handleVolumeChangeStop}
					onMouseOut={handleVolumeChangeStop}
				>
					<i className="fa-solid fa-volume-high"></i>
				</button>
			</div>

			<div className="progress-bar-container">
				<div className="time-display">
					<span>{audioRef.current ? formatTime(audioRef.current.currentTime) : "0:00"}</span> /
					<span>{formatTime(getDuration())}</span>
				</div>
				<input
					type="range"
					className="progress-bar"
					value={progress}
					onChange={(e) => {
						if (audioRef.current) {
							audioRef.current.currentTime = (e.target.value / 100) * audioRef.current.duration;
						}
					}}
				/>
			</div>
			<audio ref={audioRef} />
		</div>
	);
};

export default Home;