// import './index.css'; //全局css操作
// let styles = require('./index.css').default;
import { Http2SecureServer } from 'http2';
import styles from './index.css';

interface IPopup {
  width?: string;
  height?: string;
  title?: string;
  position?: string;
  mask?: boolean;
  content?: (content: HTMLElement) => void;
}

interface IComponent {
  tempContainer: HTMLElement;
  init: () => void;
  template: () => void;
  handle: () => void;
}

function popup(options: IPopup) {
  return new Popup(options);
}

class Popup implements IComponent {
  mask;
  /**
   *
   */
  constructor(private settings: IPopup) {
    this.settings = Object.assign(
      {
        width: '100%',
        height: '100%',
        title: '',
        position: 'center',
        mark: true,
        content: function () {},
      },
      this.settings
    );
    this.init();
  }
  tempContainer: HTMLElement;
  //初始化
  init() {
    this.template();
    this.settings.mask && this.createMask();
    this.handle();
    this.contentCallback();
  }
  //创建模板
  template() {
    this.tempContainer = document.createElement('div');
    this.tempContainer.style.width = this.settings.width;
    this.tempContainer.style.height = this.settings.height;
    this.tempContainer.className = styles.popup;
    this.tempContainer.innerHTML = `
      <div class="${styles['popup-title']}">
        <h3>${this.settings.title}</h3>
        <i class="iconfont icon-close"></i>
      </div>
      <div class="${styles['popup-content']}"></div>
    `;
    console.log(styles);
    document.body.appendChild(this.tempContainer);
    if(this.settings.position === 'left'){
      this.tempContainer.style.left = '0';
      this.tempContainer.style.top = (window.innerHeight - this.tempContainer.offsetHeight) + 'px';
    }else if (this.settings.position === 'right'){
      this.tempContainer.style.right = '0';
      this.tempContainer.style.top = (window.innerHeight - this.tempContainer.offsetHeight) + 'px';
    }else{
      this.tempContainer.style.left = (window.innerWidth - this.tempContainer.offsetWidth)/2 + 'px';
      this.tempContainer.style.top = (window.innerHeight - this.tempContainer.offsetHeight)/2 + 'px';
    }
  }
  //处理事件
  handle(){
    let popupClose = this.tempContainer.querySelector(`.${styles['popup-title']} i`);
    popupClose.addEventListener('click', () => {
      document.body.removeChild(this.tempContainer);
      this.settings.mask && document.body.removeChild(this.mask);
    });
  };
  createMask(){
    this.mask = document.createElement('div');
    this.mask.className = styles.mask;
    this.mask.style.width = '100%';
    this.mask.style.height = document.body.offsetHeight + 'px';
    document.body.appendChild(this.mask);
  }
  contentCallback(){
    let popupContent = this.tempContainer.querySelector(`.${styles['popup-content']}`);
    this.settings.content(popupContent as HTMLElement);
    // if(this.settings.content) {
    //   this.settings.content(popupContent as HTMLElement);
    // }
    // this.settings.content ? this.settings.content(popupContent) : ''
  }
}

export default popup;
