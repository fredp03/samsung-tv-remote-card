const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

console.info(
  `%c SAMSUNG-TV-REMOTE-CARD %c v1.0.6 `,
  "color: white; background: #555; font-weight: bold;",
  "color: white; background: #1428a0; font-weight: bold;"
);

// Samsung TV Key Commands for remote.send_command
const SAMSUNG_KEYS = {
  power: "KEY_POWER",
  up: "KEY_UP",
  down: "KEY_DOWN",
  left: "KEY_LEFT",
  right: "KEY_RIGHT",
  enter: "KEY_ENTER",
  back: "KEY_RETURN",
  home: "KEY_HOME",
  mute: "KEY_MUTE",
  play_pause: "KEY_PLAY",
};

class SamsungTvRemoteCard extends LitElement {
  static properties = {
    hass: {},
    config: {},
  };

  static styles = css`
    :host {
      --remote-bg: #373737;
      --button-area-bg: linear-gradient(135deg, #383838 100%, #3e3e3e 0%);
      --text-color: #d5d5d5;
      --icon-color: #d5d5d5;
      display: block;
      height: 100%;
    }

    .remote-wrapper {
      display: block;
      width: 100%;
      height: 100%;
    }

    .remote {
      width: 100%;
      height: 100%;
      background: var(--remote-bg);
      box-shadow: 1px 1px 3px rgba(22, 22, 22, 0.9);
      overflow: hidden;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    }

    /* Top control buttons (Power) */
    .control-buttons-top {
      align-self: stretch;
      flex: 0 0 auto;
      padding: 16px;
      display: flex;
      justify-content: flex-end;
      align-items: flex-start;
    }

    /* D-Pad / Navigation area - flexible layout */
    .remote-buttons {
      align-self: stretch;
      flex: 1 1 0;
      min-height: 0;
      padding: 16px;
      background: var(--button-area-bg);
      box-shadow: 1px 1px 3px rgba(44, 44, 44, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .spacer {
      flex: 1 1 0;
      min-height: 0;
    }

    .dpad-container {
      align-self: stretch;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .top-row,
    .bottom-row {
      align-self: stretch;
      flex: 1 1 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .middle-row {
      align-self: stretch;
      flex: 1 1 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .nav-button {
      width: 20%;
      aspect-ratio: 1;
      padding: 5px;
      border-radius: 7px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.15s ease;
      background: transparent;
      border: none;
      -webkit-tap-highlight-color: transparent;
    }

    .nav-button svg {
      width: 100%;
      height: 100%;
    }

    .nav-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .nav-button:active {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(0.95);
    }

    /* Center select button with styled circle */
    .center-button {
      width: 25%;
      aspect-ratio: 1;
      padding: 0;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.15s ease;
      background: #d5d5d5;
      border: none;
      box-shadow: 
        -1px -1px 2px rgba(119, 119, 119, 0.5),
        1px 1px 2px rgba(255, 255, 255, 0.3),
        inset 1px 1px 3px rgba(119, 119, 119, 0.9),
        inset -1px -1px 2px rgba(255, 255, 255, 0.9);
      -webkit-tap-highlight-color: transparent;
    }

    .center-button:hover {
      background: #e0e0e0;
    }

    .center-button:active {
      background: #c8c8c8;
      transform: scale(0.95);
    }

    /* Middle control buttons (Back, Home, Play/Pause) */
    .control-buttons-middle {
      align-self: stretch;
      flex: 0 0 auto;
      padding: 24px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .icon-wrapper {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    /* Bottom control (Mute) */
    .control-buttons-bottom {
      align-self: stretch;
      flex: 0 0 auto;
      padding: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .icon-button {
      padding: 12px;
      border-radius: 7px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.15s ease;
      background: transparent;
      border: none;
      -webkit-tap-highlight-color: transparent;
    }

    .icon-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .icon-button:active {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(0.95);
    }

    .icon-button.small {
      width: 48px;
      height: 48px;
    }

    .icon-button.medium {
      width: 54px;
      height: 54px;
    }

    .icon-button.mute {
      width: 42px;
      height: 42px;
    }

    .icon-button.play-pause {
      width: 54px;
      height: 54px;
      padding: 12px 15px;
    }

    svg {
      display: block;
    }

    .error-message {
      color: #d32f2f;
      padding: 20px;
      border-radius: 4px;
      background: #ffebee;
      font-family: Roboto, sans-serif;
    }
  `;

  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity (media_player or remote)");
    }
    this.config = {
      haptic: true,
      use_samsungtv_smart: false,
      ...config,
    };
  }

  render() {
    if (!this.hass) {
      return html`<div class="error-message">
        Home Assistant is not available
      </div>`;
    }

    const entity = this.hass.states[this.config.entity];

    if (!entity) {
      return html`<div class="error-message">
        Entity not found: ${this.config.entity}
      </div>`;
    }

    return html`
      <div class="remote-wrapper">
        <div class="remote">
          <!-- Power Button -->
          <div class="control-buttons-top">
            <button
              class="icon-button small"
              @click=${() => this._handleButtonClick("power")}
              title="Power"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.875 3.5565C18.7338 4.62965 20.1865 6.28615 21.0078 8.26908C21.8292 10.252 21.9733 12.4506 21.4178 14.5237C20.8623 16.5969 19.6382 18.4289 17.9354 19.7354C16.2326 21.042 14.1463 21.7502 12 21.7502C9.85369 21.7502 7.76736 21.042 6.06458 19.7354C4.3618 18.4289 3.13773 16.5969 2.58223 14.5237C2.02672 12.4506 2.17082 10.252 2.99218 8.26908C3.81353 6.28615 5.26625 4.62965 7.125 3.5565M12 2.25V9.75"
                  stroke="var(--icon-color, #D5D5D5)"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <!-- D-Pad Navigation -->
          <div class="remote-buttons">
            <div class="spacer"></div>
            <div class="dpad-container">
              <!-- Up Row -->
              <div class="top-row">
                <button
                  class="nav-button"
                  @click=${() => this._handleButtonClick("up")}
                  title="Up"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.52197 20.7391L14.0002 8.26087L26.4785 20.7391"
                      stroke="var(--icon-color, #D5D5D5)"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <!-- Middle Row: Left, Select, Right -->
              <div class="middle-row">
                <button
                  class="nav-button"
                  @click=${() => this._handleButtonClick("left")}
                  title="Left"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.239 26.4783L7.76074 14L20.239 1.52173"
                      stroke="var(--icon-color, #D5D5D5)"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>

                <!-- Center Select Button -->
                <button
                  class="center-button"
                  @click=${() => this._handleButtonClick("enter")}
                  title="Select"
                ></button>

                <button
                  class="nav-button"
                  @click=${() => this._handleButtonClick("right")}
                  title="Right"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.76074 1.52173L20.239 14L7.76074 26.4783"
                      stroke="var(--icon-color, #D5D5D5)"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <!-- Down Row -->
              <div class="bottom-row">
                <button
                  class="nav-button"
                  @click=${() => this._handleButtonClick("down")}
                  title="Down"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M26.4785 7.26087L14.0002 19.7391L1.52197 7.26087"
                      stroke="var(--icon-color, #D5D5D5)"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div class="spacer"></div>
          </div>

          <!-- Back, Home, Play/Pause buttons -->
          <div class="control-buttons-middle">
            <!-- Back -->
            <div class="icon-wrapper">
              <button
                class="icon-button medium"
                @click=${() => this._handleButtonClick("back")}
                title="Back"
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M25.125 20.5V22H24.875V20.5H25.125ZM18 12.3936C19.8396 12.5144 21.58 13.2968 22.8916 14.6084C24.2032 15.92 24.9856 17.6604 25.1064 19.5H24.8564C24.736 17.7267 23.9795 16.0499 22.7148 14.7852C21.4501 13.5205 19.7733 12.764 18 12.6436V12.3936ZM6.30273 13.625L10.9854 18.3076L10.8076 18.4854L5.94727 13.625H6.30273ZM17 12.375V12.625H6.7168L6.5918 12.5L6.7168 12.375H17ZM10.9854 6.69238L6.30273 11.375H5.94727L10.8076 6.51465L10.9854 6.69238Z"
                    fill="var(--icon-color, #D5D5D5)"
                    stroke="var(--icon-color, #D5D5D5)"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <!-- Home -->
            <div class="icon-wrapper">
              <button
                class="icon-button medium"
                @click=${() => this._handleButtonClick("home")}
                title="Home"
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.9961 6.0188C15.3451 6.0188 15.6585 6.10866 15.9414 6.28931L16.0605 6.37231L22.792 11.468L22.7949 11.4709C23.0142 11.6317 23.1865 11.8356 23.3115 12.0872V12.0881C23.4374 12.3391 23.5 12.6039 23.5 12.885V23.7502C23.5 24.0151 23.4042 24.2445 23.1992 24.4495C22.9943 24.6544 22.7649 24.7502 22.5 24.7502H17.6445C17.4208 24.7501 17.2454 24.6773 17.1016 24.5334H17.1025C16.9581 24.3884 16.8849 24.2132 16.8848 23.9905V17.6448C16.8846 17.5068 16.7727 17.3948 16.6348 17.3948H13.3652C13.2273 17.3948 13.1154 17.5068 13.1152 17.6448V23.9905C13.1151 24.2142 13.0423 24.3896 12.8984 24.5334C12.7544 24.6775 12.5792 24.7502 12.3564 24.7502H7.5C7.23508 24.7502 7.00574 24.6544 6.80078 24.4495C6.59584 24.2445 6.50005 24.0151 6.5 23.7502V12.885L6.51172 12.677C6.53524 12.4723 6.59411 12.2763 6.68848 12.0881C6.81452 11.8368 6.98706 11.6329 7.20605 11.4719L7.20801 11.469L13.9395 6.37231L13.9404 6.37134C14.2484 6.1362 14.5973 6.01883 14.9961 6.0188ZM15 6.76978C14.7719 6.76978 14.5659 6.84235 14.3936 6.98755L7.66211 12.0598L7.65234 12.0686C7.53407 12.1674 7.43677 12.2831 7.36426 12.4153C7.2855 12.5591 7.24917 12.7177 7.25 12.885V23.7502C7.25011 23.8882 7.36199 24.0002 7.5 24.0002H12.1152C12.2531 24.0001 12.3651 23.8881 12.3652 23.7502V17.4036C12.3653 17.1811 12.4382 17.0067 12.583 16.8625V16.8616C12.7272 16.7167 12.9025 16.6438 13.125 16.6438H16.875C17.0974 16.6438 17.2728 16.7166 17.418 16.8616C17.562 17.0056 17.6347 17.1808 17.6348 17.4036V23.7502C17.6349 23.8881 17.7469 24.0001 17.8848 24.0002H22.5C22.638 24.0002 22.7499 23.8882 22.75 23.7502V12.885C22.75 12.7191 22.7133 12.5612 22.6367 12.4172C22.5644 12.2815 22.4661 12.164 22.3447 12.0657L22.3379 12.0608L15.6084 6.98755H15.6074C15.4345 6.84255 15.2283 6.76978 15 6.76978Z"
                    fill="var(--icon-color, #D5D5D5)"
                    stroke="var(--icon-color, #D5D5D5)"
                    stroke-width="0.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <!-- Play/Pause -->
            <div class="icon-wrapper">
              <button
                class="icon-button play-pause"
                @click=${() => this._handleButtonClick("play_pause")}
                title="Play/Pause"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask id="path-1-inside-1_24_534" fill="white">
                    <path
                      d="M16.74 20.1655C17.1973 20.1655 17.5671 19.8154 17.5671 19.3581V4.90541C17.567 4.79726 17.5455 4.6902 17.5038 4.59042C17.4621 4.49065 17.401 4.40013 17.3241 4.32409C17.2472 4.24806 17.1559 4.18802 17.0557 4.14744C16.9554 4.10687 16.8481 4.08656 16.74 4.08769C16.2823 4.08769 15.9026 4.44769 15.9026 4.90541V19.3581C15.9026 19.8154 16.2823 20.1655 16.7396 20.1655M23.1724 20.1655C23.6297 20.1655 23.9996 19.8154 23.9996 19.3581V4.90541C23.9995 4.79726 23.9779 4.6902 23.9362 4.59042C23.8945 4.49065 23.8334 4.40013 23.7565 4.32409C23.6796 4.24806 23.5884 4.18802 23.4881 4.14744C23.3879 4.10687 23.2806 4.08656 23.1724 4.08769C22.7151 4.08769 22.3354 4.44769 22.3354 4.90541V19.3581C22.3354 19.8154 22.7151 20.1655 23.1724 20.1655ZM1.401 19.7764C1.8 19.7764 2.13086 19.65 2.52043 19.4164L12.4376 13.5767C13.1284 13.1683 13.4301 12.6814 13.4301 12.1268C13.4301 11.5723 13.1284 11.0854 12.4376 10.6765L2.52086 4.83726C2.12186 4.60369 1.80086 4.47726 1.40143 4.47726C0.642857 4.47726 0 5.06098 0 6.15126V18.1024C0 19.1927 0.642 19.7764 1.401 19.7764ZM1.83 17.976C1.68386 17.976 1.56686 17.8787 1.56686 17.6841V6.56955C1.56686 6.37498 1.68386 6.27769 1.82957 6.27769C1.89814 6.27769 1.96586 6.30683 2.06314 6.36512L11.319 11.8543C11.4549 11.9323 11.5329 11.9905 11.5329 12.1268C11.5329 12.2533 11.4549 12.3214 11.3186 12.3994L2.06314 17.8885C1.97571 17.9468 1.89829 17.976 1.83 17.976Z"
                    />
                  </mask>
                  <path
                    d="M16.74 20.1655C17.1973 20.1655 17.5671 19.8154 17.5671 19.3581V4.90541C17.567 4.79726 17.5455 4.6902 17.5038 4.59042C17.4621 4.49065 17.401 4.40013 17.3241 4.32409C17.2472 4.24806 17.1559 4.18802 17.0557 4.14744C16.9554 4.10687 16.8481 4.08656 16.74 4.08769C16.2823 4.08769 15.9026 4.44769 15.9026 4.90541V19.3581C15.9026 19.8154 16.2823 20.1655 16.7396 20.1655M23.1724 20.1655C23.6297 20.1655 23.9996 19.8154 23.9996 19.3581V4.90541C23.9995 4.79726 23.9779 4.6902 23.9362 4.59042C23.8945 4.49065 23.8334 4.40013 23.7565 4.32409C23.6796 4.24806 23.5884 4.18802 23.4881 4.14744C23.3879 4.10687 23.2806 4.08656 23.1724 4.08769C22.7151 4.08769 22.3354 4.44769 22.3354 4.90541V19.3581C22.3354 19.8154 22.7151 20.1655 23.1724 20.1655ZM1.401 19.7764C1.8 19.7764 2.13086 19.65 2.52043 19.4164L12.4376 13.5767C13.1284 13.1683 13.4301 12.6814 13.4301 12.1268C13.4301 11.5723 13.1284 11.0854 12.4376 10.6765L2.52086 4.83726C2.12186 4.60369 1.80086 4.47726 1.40143 4.47726C0.642857 4.47726 0 5.06098 0 6.15126V18.1024C0 19.1927 0.642 19.7764 1.401 19.7764ZM1.83 17.976C1.68386 17.976 1.56686 17.8787 1.56686 17.6841V6.56955C1.56686 6.37498 1.68386 6.27769 1.82957 6.27769C1.89814 6.27769 1.96586 6.30683 2.06314 6.36512L11.319 11.8543C11.4549 11.9323 11.5329 11.9905 11.5329 12.1268C11.5329 12.2533 11.4549 12.3214 11.3186 12.3994L2.06314 17.8885C1.97571 17.9468 1.89829 17.976 1.83 17.976Z"
                    fill="var(--icon-color, #D5D5D5)"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Mute button -->
          <div class="control-buttons-bottom">
            <button
              class="icon-button mute"
              @click=${() => this._handleButtonClick("mute")}
              title="Mute"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.6974 14.3492C13.6487 14.4015 13.5899 14.4434 13.5247 14.4725C13.4594 14.5016 13.3889 14.5172 13.3175 14.5185C13.246 14.5198 13.175 14.5066 13.1088 14.4799C13.0425 14.4531 12.9823 14.4133 12.9318 14.3627C12.8813 14.3122 12.8414 14.252 12.8147 14.1858C12.7879 14.1195 12.7748 14.0485 12.776 13.9771C12.7773 13.9056 12.7929 13.8352 12.822 13.7699C12.8511 13.7046 12.893 13.6459 12.9453 13.5971C15.2441 11.2983 15.4584 7.7047 13.5888 5.16396L12.5622 6.19061C13.2516 7.065 13.5962 8.1619 13.5308 9.27343C13.4654 10.385 12.9946 11.4339 12.2074 12.2214C12.1583 12.2722 12.0996 12.3127 12.0346 12.3406C11.9697 12.3684 11.8999 12.3831 11.8292 12.3837C11.7586 12.3842 11.6885 12.3708 11.6231 12.344C11.5577 12.3172 11.4983 12.2776 11.4484 12.2277C11.3985 12.1777 11.359 12.1182 11.3323 12.0528C11.3055 11.9874 11.2921 11.9173 11.2927 11.8467C11.2934 11.776 11.3081 11.7062 11.336 11.6413C11.3639 11.5764 11.4045 11.5177 11.4554 11.4686C12.043 10.8807 12.401 10.102 12.4648 9.27313C12.5286 8.4443 12.2938 7.61999 11.803 6.94908L10.235 8.51708V15.3922C10.235 15.5333 10.1789 15.6687 10.0791 15.7685C9.97935 15.8683 9.844 15.9243 9.70288 15.9243C8.2342 15.9243 7.01952 14.9736 6.22133 14.1335C5.96061 13.8578 5.7159 13.5674 5.48841 13.2637L2.98385 15.7682C2.88298 15.8622 2.74956 15.9134 2.6117 15.911C2.47384 15.9085 2.34231 15.8527 2.24481 15.7552C2.14732 15.6577 2.09147 15.5262 2.08904 15.3883C2.08661 15.2505 2.13778 15.117 2.23177 15.0162L4.50078 12.7472C4.33049 12.7514 4.14744 12.7507 3.96297 12.7415C3.59545 12.7216 3.16903 12.6634 2.81783 12.5024C2.44888 12.3321 2.07568 11.9965 2.07568 11.4324V6.52763C2.07568 5.96428 2.44817 5.62868 2.81783 5.4584C3.16903 5.29664 3.59616 5.23846 3.96297 5.2193C4.3433 5.20212 4.72438 5.21279 5.10315 5.25123C5.1495 5.18028 5.2039 5.10057 5.26633 5.01212C5.48983 4.69639 5.81478 4.27424 6.22417 3.85066C7.02449 3.02196 8.23845 2.08896 9.70288 2.08896C9.844 2.08896 9.97935 2.14502 10.0791 2.24481C10.1789 2.34461 10.235 2.47996 10.235 2.62109V7.01293L12.8928 4.35512C12.8174 4.25266 12.7812 4.12658 12.7908 3.99973C12.8004 3.87289 12.8551 3.75367 12.945 3.66368C13.0349 3.57369 13.1541 3.51888 13.2809 3.50919C13.4077 3.4995 13.5338 3.53556 13.6364 3.61085L15.0029 2.24505C15.0516 2.19277 15.1103 2.15083 15.1756 2.12175C15.2409 2.09267 15.3114 2.07703 15.3828 2.07577C15.4543 2.07451 15.5252 2.08765 15.5915 2.11441C15.6578 2.14118 15.7179 2.18101 15.7685 2.23154C15.819 2.28207 15.8588 2.34226 15.8856 2.40852C15.9124 2.47478 15.9255 2.54575 15.9242 2.6172C15.923 2.68865 15.9073 2.75911 15.8783 2.82439C15.8492 2.88966 15.8072 2.94841 15.755 2.99713L14.3487 4.40408C16.6298 7.36697 16.4134 11.6339 13.6981 14.3492"
                  fill="var(--icon-color, #D5D5D5)"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _handleButtonClick(keyName) {
    // Trigger haptic feedback
    if (this.config.haptic !== false) {
      this._hapticFeedback();
    }
    // Send the key command
    this._sendKey(keyName);
  }

  _hapticFeedback() {
    // Use the browser's vibration API if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    // Also fire a haptic event for Home Assistant companion app
    const event = new Event("haptic", {
      bubbles: true,
      composed: true,
    });
    event.detail = "light";
    this.dispatchEvent(event);

    // Alternative method used by other HA cards
    const hapticEvent = new CustomEvent("haptic", {
      detail: { haptic: "light" },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(hapticEvent);
  }

  _sendKey(keyName) {
    const entity = this.config.entity;
    const entityType = entity.split(".")[0];
    const key = SAMSUNG_KEYS[keyName];

    if (!key) {
      console.error(`Unknown key: ${keyName}`);
      return;
    }

    // For play/pause, use media_player service if available
    if (keyName === "play_pause" && entityType === "media_player") {
      this.hass.callService("media_player", "media_play_pause", {
        entity_id: entity,
      });
      return;
    }

    // Use remote.send_command for remote entities
    if (entityType === "remote") {
      this.hass.callService("remote", "send_command", {
        entity_id: entity,
        command: key,
      });
      return;
    }

    // For media_player entities, check if using samsungtv_smart custom integration
    if (entityType === "media_player") {
      if (this.config.use_samsungtv_smart) {
        // Use samsungtv_smart custom integration
        this.hass.callService("samsungtv_smart", "send_key", {
          entity_id: entity,
          key: key,
        });
      } else {
        // Use standard Samsung TV integration via remote.send_command
        // The standard integration creates both media_player and remote entities
        // Try to find the corresponding remote entity
        const remoteEntity = entity.replace("media_player.", "remote.");
        if (this.hass.states[remoteEntity]) {
          this.hass.callService("remote", "send_command", {
            entity_id: remoteEntity,
            command: key,
          });
        } else {
          // Fallback: use media_player turn_off for power
          if (keyName === "power") {
            this.hass.callService("media_player", "toggle", {
              entity_id: entity,
            });
          } else {
            console.error(
              `Cannot send key ${key}. No remote entity found for ${entity}. Consider using the remote entity directly or enable use_samsungtv_smart.`
            );
          }
        }
      }
    }
  }

  getCardSize() {
    return 10;
  }

  static getConfigElement() {
    return document.createElement("samsung-tv-remote-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
      haptic: true,
      use_samsungtv_smart: false,
    };
  }
}

// Simple config editor
class SamsungTvRemoteCardEditor extends LitElement {
  static properties = {
    hass: {},
    config: {},
  };

  static styles = css`
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    label {
      font-weight: 500;
      font-size: 14px;
    }
    input,
    select {
      padding: 8px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      font-size: 14px;
    }
    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .helper-text {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
  `;

  setConfig(config) {
    this.config = config;
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    const entities = Object.keys(this.hass.states).filter(
      (e) => e.startsWith("media_player.") || e.startsWith("remote.")
    );

    return html`
      <div class="form">
        <div class="form-row">
          <label>Entity</label>
          <select
            .value=${this.config.entity || ""}
            @change=${(e) => this._valueChanged("entity", e.target.value)}
          >
            <option value="">Select entity...</option>
            ${entities.map(
              (entity) => html`
                <option
                  value=${entity}
                  ?selected=${entity === this.config.entity}
                >
                  ${this.hass.states[entity].attributes.friendly_name ||
                  entity}
                </option>
              `
            )}
          </select>
          <span class="helper-text"
            >Select your Samsung TV media_player or remote entity</span
          >
        </div>

        <div class="form-row">
          <div class="checkbox-row">
            <input
              type="checkbox"
              id="haptic"
              .checked=${this.config.haptic !== false}
              @change=${(e) => this._valueChanged("haptic", e.target.checked)}
            />
            <label for="haptic">Enable Haptic Feedback</label>
          </div>
          <span class="helper-text"
            >Vibrate on button press (requires HA companion app)</span
          >
        </div>

        <div class="form-row">
          <div class="checkbox-row">
            <input
              type="checkbox"
              id="use_samsungtv_smart"
              .checked=${this.config.use_samsungtv_smart || false}
              @change=${(e) =>
                this._valueChanged("use_samsungtv_smart", e.target.checked)}
            />
            <label for="use_samsungtv_smart"
              >Use SamsungTV Smart Component</label
            >
          </div>
          <span class="helper-text"
            >Enable if using the ha-samsungtv-smart custom integration</span
          >
        </div>
      </div>
    `;
  }

  _valueChanged(key, value) {
    const newConfig = { ...this.config, [key]: value };
    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

if (!customElements.get("samsung-tv-remote-card")) {
  customElements.define("samsung-tv-remote-card", SamsungTvRemoteCard);
}

if (!customElements.get("samsung-tv-remote-card-editor")) {
  customElements.define(
    "samsung-tv-remote-card-editor",
    SamsungTvRemoteCardEditor
  );
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "samsung-tv-remote-card",
  name: "Samsung TV Remote Card",
  description:
    "A sleek Samsung TV remote card with D-pad navigation, power, home, back, play/pause, and mute controls.",
  preview: true,
});
