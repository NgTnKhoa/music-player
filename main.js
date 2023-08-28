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
            name: 'Ngày Mai Người Ta Lấy Chồng',
            singer: 'Thành Đạt',
            path: './assets/music/NgayMaiNguoiTaLayChong-AnhTu.mp3',
            image: './assets/img/NMNTLC-img.jpg'
        },
        {
            name: 'Anh Tự Do Nhưng Cô Đơn',
            singer: 'Đạt G',
            path: './assets/music/AnhTuDoNhungCoDon-DatG.mp3',
            image: './assets/img/ATDNCD-img.jpg'
        },
        {
            name: 'Havana',
            singer: 'Camila Cabello',
            path: './assets/music/Havana-CamilaCabello.mp3',
            image: './assets/img/HVN-img.jpg'
        },
        {
            name: 'Hãy Trao Cho Anh',
            singer: 'Sơn Tùng MTP',
            path: './assets/music/HayTraoChoAnh-SonTungMTP.mp3',
            image: './assets/img/HTCA-img.jpg'
        },
        {
            name: 'Ngủ Một Mình',
            singer: 'HIEUTHUHAI',
            path: './assets/music/NguMotMinh-HIEUTHUHAI.mp3',
            image: './assets/img/NMM-img.jpg'
        },
        {
            name: 'Ngày Mai Em Đi Mất',
            singer: 'Đạt G',
            path: './assets/music/NgayMaiEmDiMat-DatG.mp3',
            image: './assets/img/NMEDM-img.jpg'
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
