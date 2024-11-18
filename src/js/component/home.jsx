import React, { useRef, useState, useEffect } from "react";

const Home = ({
	songs = [
		{ title: "Song 1", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
		{ title: "Song 2", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
		{ title: "Song 3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
		{ title: "Song 4", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
		{ title: "Song 5", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
		{ title: "Song 6", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
		{ title: "Song 7", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
		{ title: "Song 8", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
		{ title: "Song 9", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
		{ title: "Song 10", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
		{ title: "Song 11", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
		{ title: "Song 12", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" },
		{ title: "Song 13", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3" },
		{ title: "Song 14", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3" },
		{ title: "Song 15", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" },
		{ title: "Song 16", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3" },
		{ title: "Song 17", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3" },
	],
	backgroundColor = "#282828",
	repeat = false,
}) => {
	const audioRef = useRef(null);
	const [currentSongIndex, setCurrentSongIndex] = useState(0);
	const [isRepeating, setIsRepeating] = useState(repeat);
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const [volumeInterval, setVolumeInterval] = useState(null);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = 0.5;
		}
	}, []);

	const playSong = (index) => {
		setCurrentSongIndex(index);
		if (audioRef.current) {
			audioRef.current.src = songs[index].url;
			audioRef.current.play();
			setIsPlaying(true);
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
			<ul className="song-list">
				{songs.map((song, index) => (
					<li key={index} onClick={() => playSong(index)} className={index === currentSongIndex ? "active" : ""}>
						{index + 1}. {song.title}
					</li>
				))}
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
