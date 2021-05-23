import { type } from "os";
import styles from './index.css';
// let styles = require('./index.css');

interface IVideo {
  url: string;
  element: string | HTMLElement;
  width?: string;
  height?: string;
  autoplay?: boolean;
}

interface IComponent {
  tempContainer: HTMLElement;
  init: () => void;
  template: () => void;
  handle: () => void;
}

function video(options: IVideo) {
  return new Video(options);
}

class Video implements IComponent{
  /**
   *
   */
  constructor(private settings: IVideo) {
    this.settings = Object.assign(
      {
        width: '100%',
        height: '100%',
        autoplay: false,
      },
      this.settings
    );
    this.init();
  }
  tempContainer: HTMLElement;
  init(){
    this.template();
    this.handle();
  }
  template(){
    this.tempContainer = document.createElement('div');
    this.tempContainer.className = styles.video;
    this.tempContainer.style.width = this.settings.width;
    this.tempContainer.style.height = this.settings.height;
    this.tempContainer.innerHTML = `
      <video class="${styles['video-content']}" src="${this.settings.url}"></video>
      <div class="${styles['video-controls']}">
        <div class="${styles['video-progress']}">
          <div class="${styles['video-progress-now']}"></div>
          <div class="${styles['video-progress-cache']}"></div>
          <div class="${styles['video-progress-dot-bar']}"></div>
        </div>
        <div class="${styles['video-play']}">
          <i class="iconfont icon-play1"></i>
        </div>
        <div class="${styles['video-time']}">
          <span>00:00</span> / <span>00:00</span>
        </div>
        <div class="${styles['video-full']}">
          <i class="iconfont icon-full"></i>
        </div>
        <div class="${styles['video-volume']}">
          <i class="iconfont icon-volume"></i>
          <div class="${styles['video-volume-progress']}">
            <div class="${styles['video-volume-progress-now']}"></div>
            <div class="${styles['video-volume-progress-dot-bar']}"></div>
          </div>
        </div>
      </div>
    `;
    if(typeof this.settings.element === 'object'){
      this.settings.element.appendChild(this.tempContainer);
    }else{
      document.querySelector(`${this.settings.element}`).appendChild(this.tempContainer);
    }
    
  }
  handle(){
    let videoContent = this.tempContainer.querySelector(`.${styles['video-content']}`) as HTMLVideoElement;
    let videoControls = this.tempContainer.querySelector(`.${styles['video-controls']}`) as HTMLElement;
    let videoPlay = this.tempContainer.querySelector(`.${styles['video-play']} i`);
    let videoTimes = this.tempContainer.querySelectorAll(`.${styles['video-time']} span`);
    let videoFullIcon = this.tempContainer.querySelector(`.${styles['video-full']} i`);
    let videoProgresses = this.tempContainer.querySelectorAll(`.${styles['video-progress']} div`);
    const videoNowProgress = videoProgresses[0] as HTMLElement;
    const videoCacheProgress = videoProgresses[1] as HTMLElement;
    const videoDotProgress = videoProgresses[2] as HTMLElement;
    let videoVolumeProgresses = this.tempContainer.querySelectorAll(`.${styles['video-volume-progress']} div`);
    const videoVolumeNowProgress = videoVolumeProgresses[0] as HTMLElement;
    const videoVolumeDotProgress = videoVolumeProgresses[1] as HTMLElement;
    let videoVolumeIcon = this.tempContainer.querySelector(`.${styles['video-volume']} i`);
    videoContent.volume = 0.5;

    if(this.settings.autoplay){
      videoContent.play();
    }

    //监听视频是否加载完毕
    videoContent.addEventListener('canplay', () => {
      console.log('canplay');
      videoTimes[1].innerHTML = formatTime(videoContent.duration);
    });
    //监听视频播放事件
    videoContent.addEventListener('play', () => {
      console.log('play');
      videoPlay.className = 'iconfont icon-pause';
    });
    //监听视频暂停事件
    videoContent.addEventListener('pause', () => {
      console.log('pause');
      videoPlay.className = 'iconfont icon-play1';
    });

    videoContent.addEventListener('click', () => {
      if(videoContent.paused){
        videoContent.play();
      }else{
        videoContent.pause();
      }
    });

    videoPlay.addEventListener('click', () => {
      if(videoContent.paused){
        videoContent.play();
      }else{
        videoContent.pause();
      }
    });

    videoContent.addEventListener('timeupdate', () => {
      videoTimes[0].innerHTML = formatTime(videoContent.currentTime);
      const currentScale = videoContent.currentTime / videoContent.duration;
      const cacheScale = videoContent.buffered.end(0) / videoContent.duration;
      // videoTimeNowProgress.style.width = currentScale * 100 + '%';
      setControlStyle(videoNowProgress, 'width', currentScale);
      // videoCacheProgress.style.width = cacheScale * 100 + '%';
      setControlStyle(videoCacheProgress, 'width', cacheScale);
      // videoDotProgress.style.left = currentScale * 100 + '%';
      setControlStyle(videoDotProgress, 'left', currentScale);

    });

    videoFullIcon.addEventListener('click', () => {
      videoContent.requestFullscreen();
    });

    videoDotProgress.addEventListener('mousedown', function(event: MouseEvent) {
      event.preventDefault();

      let mousedownX = event.pageX;
      let mousedownOffsetLeft = this.offsetLeft;
      document.onmousemove = (event: MouseEvent) => {
        let scale = (event.pageX - mousedownX + mousedownOffsetLeft + 8) / this.parentElement.offsetWidth; //8是小球的半径
        if(scale < 0){
          scale = 0;
        }else if(scale > 1){
          scale = 1;
        }
        setControlStyle(videoNowProgress, 'width', scale);
        setControlStyle(videoCacheProgress, 'width', scale);
        setControlStyle(videoDotProgress, 'left', scale);
        videoContent.currentTime = scale * videoContent.duration;
      };
      document.onmouseup = (event: MouseEvent) => {
        document.onmousemove = document.onmouseup = null;
      };
    });

    videoVolumeIcon.addEventListener('click', () => {
      if(videoContent.volume === 0){
        videoVolumeIcon.className = 'iconfont icon-volume';
        videoContent.volume = 0.5;
        setControlStyle(videoVolumeNowProgress, 'width', videoContent.volume);
        setControlStyle(videoVolumeDotProgress, 'left', videoContent.volume);
      }else{
        videoVolumeIcon.className = 'iconfont icon-close';
        videoContent.volume = 0;
        setControlStyle(videoVolumeNowProgress, 'width', videoContent.volume);
        setControlStyle(videoVolumeDotProgress, 'left', videoContent.volume);
      }
      
    });

    videoVolumeDotProgress.addEventListener('mousedown', function(event: MouseEvent) {
      event.preventDefault();

      let mousedownX = event.pageX;
      let mousedownOffsetLeft = this.offsetLeft;
      document.onmousemove = (event: MouseEvent) => {
        let scale = (event.pageX - mousedownX + mousedownOffsetLeft + 8) / this.parentElement.offsetWidth; //8是小球的半径
        if(scale < 0){
          scale = 0;
        }else if(scale > 1){
          scale = 1;
        }
        setControlStyle(videoVolumeNowProgress, 'width', scale);
        setControlStyle(videoVolumeDotProgress, 'left', scale);
        videoContent.volume = scale;
        if(scale === 0){
          videoVolumeIcon.className = 'iconfont icon-close';
        }else{
          videoVolumeIcon.className = 'iconfont icon-volume';
        }
      };
      document.onmouseup = (event: MouseEvent) => {
        document.onmousemove = document.onmouseup = null;
      };
    });

    this.tempContainer.addEventListener('mouseenter', function(){
      videoControls.style.bottom = '0';
    });
    this.tempContainer.addEventListener('mouseleave', function(){
      videoControls.style.bottom = '-60px';
    });

    function setControlStyle(element: HTMLElement, cssProperty: string, scale: number) {
      element.style[cssProperty] = scale * 100 + '%';
    }

    function formatTime(totalSeconds: number): string {
      const totalSecondsInteger = Math.round(totalSeconds);
      const minutesInteger = Math.floor(totalSecondsInteger/60);
      const secondsInteger = totalSecondsInteger%60;
      return addZero(minutesInteger) + ':' + addZero(secondsInteger);
    }

    function addZero(number: number): string {
      if(number < 10) return '0' + number;
      return number + '';
    }
  }
}

export default video;