const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const playlist = $('.playlist');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const preBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const app = {
    currentIndex: 0,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Đừng Ai Nhắc Về Cô Ấy',
            singer: 'Remix',
            path: './assets/music/Đừng ai nhắc về cô ấy Remix.mp3',
            image: './assets/img/1.jpg'
        },
        {
            name: 'Đừng Quay Đi Anh Hãy Nhìn Lại',
            singer: 'Remix',
            path: './assets/music/Đừng quay đi em hãy nhìn lại hay là em hết yêu anh Remix.mp3',
            image: './assets/img/2.jpg'
        },
        {
            name: 'Em Đã Xa Anh',
            singer: 'Remix',
            path: './assets/music/Em đã xa anh Remix.mp3',
            image: './assets/img/3.jpg'
        },
        {
            name: 'Em Là Kẻ Đáng Thương',
            singer: 'Remix',
            path: './assets/music/Em là kẻ đáng thương Remix.mp3',
            image: './assets/img/4.jpg'
        },
        {
            name: 'Giá Như Anh Là Người Vô Tâm',
            singer: 'Remix',
            path: './assets/music/Giá như anh là người vô tâm Remix.mp3',
            image: './assets/img/5.jpg'
        },
        {
            name: 'Không Còn Trọn Vẹn',
            singer: 'Remix',
            path: './assets/music/Không còn trọn vẹn Remix.mp3',
            image: './assets/img/6.jpg'
        },
        {
            name: 'Kissing On My Tattoos',
            singer: 'Remix',
            path: './assets/music/Kissing On My Tattoos Remix.mp3',
            image: './assets/img/7.jpg'
        },
        {
            name: 'Lụy Tình',
            singer: 'Remix',
            path: './assets/music/Lụy tình Remix.mp3',
            image: './assets/img/8.jpg'
        },
        {
            name: 'Yêu Đừng Sợ Đau',
            singer: 'Remix',
            path: './assets/music/Yêu đừng sợ đau Remix.mp3',
            image: './assets/img/9.jpg'
        },
        {
            name: 'Yêu Thương Chẳng Là Mãi Mãi',
            singer: 'Remix',
            path: './assets/music/Yêu thương chẳng là mãi mãi Remix.mp3',
            image: './assets/img/10.jpg'
        },
        {
            name: 'Khuất lối',
            singer: 'Remix',
            path: './assets/music/Khuất Lối Remix.mp3',
            image: './assets/img/11.jpg'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                    <div class="song ${index == this.currentIndex ? 'active' : ''}" data-index="${index}">
                        <div class="thumb" style="background-image: url('${song.image}');">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>
                    `;
        })
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        });
    },
    handleEvent: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        //rotate and stop CD
        const cdAnimation = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        });
        cdAnimation.pause();

        //zoom in and out top
        document.onscroll = function () {
            const scrollY = window.scrollY;
            // const scrollY = document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollY;
            cd.style.width = newCdWidth > 0 ? `${newCdWidth}px` : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        //click play
        playBtn.onclick = function () {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        }
        audio.onplay = function () {
            player.classList.add('playing');
            cdAnimation.play();
        }
        audio.onpause = function () {
            player.classList.remove('playing');
            cdAnimation.pause();
        }

        //change the progress
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const currentProgress = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = currentProgress;
            }
        }

        //rewind song
        progress.onchange = function () {
            const seekTime = progress.value / 100 * audio.duration;
            audio.currentTime = seekTime;
        }

        //previous song
        preBtn.onclick = function () {
            player.classList.add('playing');
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.preSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        //next song
        nextBtn.onclick = function () {
            player.classList.add('playing');
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        //random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            this.classList.toggle('active', _this.isRandom);
        }

        //repeat song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            this.classList.toggle('active', _this.isRepeat);
        }

        //next song when audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        //click on playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {
                //clich on song
                if (songNode) {
                    _this.currentIndex = songNode.dataset.index;//for class "data-..."
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
                //click on option
                if (e.target.closest('.option')) {

                }
            }
        }
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    preSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    randomSong: function () {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * this.songs.length);
        } while (randomIndex == this.currentIndex);
        this.currentIndex = randomIndex;
        this.loadCurrentSong();
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 500);;
    },
    start: function () {
        this.loadConfig();
        this.defineProperties();
        this.handleEvent();
        this.loadCurrentSong();
        this.render();

        // randomBtn.classList.toggle('active', this.isRandom);
        // repeatBtn.classList.toggle('active', this.isRepeat);
    } 
}
app.start();
