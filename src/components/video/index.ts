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
          <div class="${styles['video-progress-suc']}"></div>
          <div class="${styles['video-progress-bar']}"></div>
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
            <div class="${styles['video-volume-progress-bar']}"></div>
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
    let videoControls = this.tempContainer.querySelector(`.${styles['video-controls']}`);
    let videoPlay = this.tempContainer.querySelector(`.${styles['video-play']} i`);

    //监听视频是否加载完毕
    videoContent.addEventListener('canplay', () => {
      console.log('canplay');
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

    videoPlay.addEventListener('click', () => {
      if(videoContent.paused){
        videoContent.play();
      }else{
        videoContent.pause();
      }
    });
  }
}

export default video;