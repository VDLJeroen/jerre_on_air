import axios from "axios";
import React, { Component } from "react";
import Button from 'react-bootstrap/Button';
import ReactPlayer from 'react-player/youtube';
import './App.css';
import logo from './jerreOnAir.png';

const TimeLeft = () => {
    // Hardcoded festival date of Jerra on Air 2022
    const festivalDate = "23 Jun 2022 12:00:00 GMT";
    const hoursTillFestival = (Date.parse(festivalDate) - Date.now()) / (60 * 60 * 1000);
    const daysLeft = Math.floor(hoursTillFestival / 24);
    let timeLeft;
    if (daysLeft === 0) {
        const hoursLeft = Math.floor(hoursTillFestival % 24);
        timeLeft = hoursLeft + ' hours left';
    } else {
        timeLeft = daysLeft + ' days left';
    }
    return <h1 className="text-white">{timeLeft}</h1>
}

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            songs: [],
            index: 0,
            currentSong: null,
            currentArtist: {
                name: "",
                picture: ""
            },
        };
    }

    componentDidMount() {
        this.refreshList();
    }

    refreshList = () => {
        axios
            .get("/api/songs/notlistenedyet")
            .then((res) => {
                const songs = res.data;
                if (songs && songs.length > this.state.index) {
                    const currentSong = songs[this.state.index];
                    this.setState({ songs, currentSong });
                    this.setMoreSongInfo(currentSong);
                }
            })
            .catch((err) => console.log(err));
    };

    setMoreSongInfo = (song) => {
        this.setArtist(song.artist);
        this.getCurrentRating(song.id);
    }


    setArtist = (id) => {
        axios
            .get("/api/artists/" + id)
            .then((res) => this.setState({ currentArtist: res.data }))
            .catch((err) => console.log(err));
    }

    skip = () => {
        axios
            .post("/api/ratings/", {
                song: this.state.currentSong.id,
                score_given: false,
                skipped: true,
                listened: true
            })
            .then((res) => console.log(res))
            .catch((err) => console.log(err));
        this.nextSong();
    }

    getCurrentRating = (id) => {
        axios
            .get("/api/ratings/?song=" + id)
            .then((res) => {
                console.log(res.data)
                if (res.data.length > 0) {
                    this.setState({
                        currentSong: {
                            ...this.state.currentSong,
                            rating: res.data[0].score,
                            rating_id: res.data[0].id
                        }
                    })
                }
            })
            .catch((err) => console.log(err));
    }

    giveMissedRating = (id, rating) => {
        axios.post("/api/ratings/", {
            song: id,
            score_given: true,
            score: rating,
            skipped: false,
            listened: true
        })
            .then((res) => console.log(res))
            .catch((err) => console.log(err));
    }



    giveRating = (rating, videoEnded = false) => {
        if (!videoEnded) {
            this.setState({
                currentSong: {
                    ...this.state.currentSong,
                    rating
                }
            })
        }
        if (this.state.currentSong.rating_id) {
            axios.put("/api/ratings/" + this.state.currentSong.rating_id + "/", {
                song: this.state.currentSong.id,
                score_given: true,
                score: rating,
                skipped: false,
                listened: videoEnded
            })
                .then((res) => console.log(res))
                .catch((err) => console.log(err));
        } else {
            axios.post("/api/ratings/", {
                song: this.state.currentSong.id,
                score_given: rating != null,
                score: rating,
                skipped: false,
                listened: videoEnded
            })
                .then((res) => console.log(res))
                .catch((err) => console.log(err));
        }
    }

    delete = () => {
        axios
            .delete("/api/songs/" + this.state.currentSong.id)
            .then((res) => console.log(res))
            .catch((err) => console.log(err));
        this.nextSong();
    }

    empty = () => {
        this.setState({ currentSong: null })
    }

    loadNextSong = () => {
        const nextIndex = this.state.index + 1;
        if (this.state.songs.length > nextIndex) {
            const currentSong = this.state.songs[nextIndex];
            this.setState({ currentSong, index: nextIndex });
            this.setArtist(currentSong.artist);
        }
    }

    nextSong = () => {
        this.empty();
        setTimeout(() => { this.loadNextSong(); });
    }

    getYoutubeUrl = url => ("https://www.youtube.com/watch?v=" + url)

    videoEnded = () => {
        this.giveRating(this.state.currentSong.rating, true)
        this.nextSong();
    }

    render() {
        let content, ratings;
        const song = this.state.currentSong;
        if (song) {
            const url = this.getYoutubeUrl(song.link)
            content = <ReactPlayer onEnded={this.videoEnded} url={url} width="100%" height="100%" controls='true' playing='true' />;
            ratings = [...Array(6).keys()].map(i =>
                <Button key={i} active={i === song.rating} variant="outline-warning" onClick={() => this.giveRating(i)}>{i}</Button>
            );
        } else {
            content = <span>Loading...</span>;
        }

        // if (this.state.index > 0 && this.state.songs[this.state.index - 1]) {
        //     const previousSong = this.state.songs[this.state.index - 1]
        //     previousSongContent = "Just played " + previousSong.title;
        // }

        return (
            <div className='container'>
                <div className='row'>
                    <div className='col-8 text-center pb-3'>
                        <img src={logo} alt='Logo'/>
                    </div>
                    <div className='col text-uppercase pt-4'>
                        <TimeLeft />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-8'>
                        {content}
                    </div>
                    <div className='col-4'>
                        <h2 className='text-white text-uppercase'>{this.state.currentArtist.name}</h2>
                        <img src={this.state.currentArtist.picture} alt='Artist'/>
                    </div>
                </div>
                <div className='row pt-3'>
                    <div className='col-1'>
                        <Button variant="outline-danger" onClick={() => this.delete()}>
                            Delete
                        </Button>
                    </div>
                    <div className='col-1'>
                        <Button variant="outline-info" onClick={() => this.skip()}>
                            Skip
                        </Button>
                    </div>
                    <div className='col' />
                    <div className='col-auto'>
                        {ratings}
                    </div>
                    <div className='col-4' />
                </div>
            </div >
        )
    }
}

export default App;