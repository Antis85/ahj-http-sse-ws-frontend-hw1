class WsChatApp {
  constructor() {
    this.url = 'wss://ahj-hw-ws.herokuapp.com/ws';
    // this.url = 'ws://localhost:7070/ws';
    this.container = document.querySelector('.main_container');
    this.currentUser = undefined;
    this.WsServerMessages = {};
    this.ws = new WebSocket(this.url);
    this.initWsHandlers();
  }

  initWsHandlers() {
    this.ws.addEventListener('open', () => {
      console.log('ws_opened & readyState: ', this.ws.readyState);
    });
    this.ws.addEventListener('message', (evt) => this.parseWsServerMessages(evt));
    this.ws.addEventListener('message', () => this.removeChatUser());
    this.ws.addEventListener('message', () => this.showChatMessage());
    this.ws.addEventListener('message', () => this.addNewChatUser());
    this.ws.addEventListener('message', () => this.loginReject());
    this.ws.addEventListener('message', () => this.loginSuccess());
    this.ws.addEventListener('message', () => this.initUsersList());
    this.ws.addEventListener('message', () => this.loadChatMessagesHistory());
    this.ws.addEventListener('close', (evt) => this.wsClosedHandler(evt));
    this.ws.addEventListener('error', () => {
      console.error('ws_error');
    });
  }

  wsClosedHandler(evt) {
    console.log('ws_closed & readyState: ', this.ws.readyState);
    if (evt.wasClean) {
      console.log('connection closed wasClean');
    } else {
      console.log(evt);
      console.log(`Соединение закрыто\n код: ${evt.code}`);
      console.log('connection lost, trying to reconnect');
      this.ws = new WebSocket(this.url);
      this.initWsHandlers();
    }
  }

  initLoginForm() {
    if (this.container.querySelector('.modal_active')) return;
    const widgetLoginHtml = `
    <div data-widget="login" class="modal modal_active widget_login">
      <h2>Выберите псевдоним</h2>  
      <form data-id="login-form" class="widget_form">
        <input data-id="name" name="name" required class="widget_input" placeholder="Введите здесь свой псевдоним...">  
        <div class="widget_footer">
          <span class="widget_footer_string hidden">
          </span>
        </div> 
        <div class="widget_form_controls"> 
          <button type="submit" data-id="ok" class="widget_button">Продолжить</button> 
        </div>
      </form> 
    </div>
    `;

    this.container.insertAdjacentHTML('afterBegin', widgetLoginHtml);

    const widgetLogin = this.container.querySelector('[data-widget=login]');
    const widgetLoginForm = widgetLogin.querySelector('[data-id=login-form]');

    widgetLoginForm.addEventListener('input', () => {
      widgetLoginForm.name.value = widgetLoginForm.name.value.trim();
    });

    widgetLoginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const inputName = widgetLoginForm.name.value.trim();
      if (inputName === '') return;

      const loginMessage = {
        type: 'login',
        nickname: inputName,
      };

      this.ws.send(JSON.stringify(loginMessage));
      widgetLoginForm.reset();
    });
  }

  closeLoginForm() {
    const widgetLogin = this.container.querySelector('[data-widget=login]');
    widgetLogin.remove();
  }

  loginReject() {
    if (this.WsServerMessages.type !== 'loginReject') return;
    this.container.querySelector('.widget_footer_string').innerHTML = `${this.WsServerMessages.message}`;
    this.container.querySelector('.widget_footer_string').classList.remove('hidden');
  }

  loginSuccess() {
    if (this.WsServerMessages.type !== 'loginSuccess') return;
    this.currentUser = this.WsServerMessages.message;
    this.closeLoginForm();
    this.initChat();
  }

  initChat() {
    if (this.container.querySelector('.widget_chat')) return;
    const widgetChatHtml = `
      <div data-widget="chat" class="widget_chat"> 
        <div data-id="clients-list" class="clients_list">
        </div>
        <div data-id="chat-messages-wrapper" class="chat_messages_wrapper">
          <div data-id="chat-messages" class="chat_messages">
          </div>    
          <form data-id="chat-form" class="widget_form">
            <input data-id="message" name="message" placeholder="Type your message here" required class="widget_input chat_input">   
          </form>
        </div> 
      </div>
      `;

    this.container.insertAdjacentHTML('afterBegin', widgetChatHtml);

    const widgetChat = this.container.querySelector('[data-widget=chat]');
    const widgetChatForm = widgetChat.querySelector('[data-id=chat-form]');

    widgetChatForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const inputMessage = widgetChatForm.message.value.trim();
      if (inputMessage === '') return;

      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();
      const chatMessage = {
        type: 'message',
        message: inputMessage,
        nickname: this.currentUser,
        datestamp: `${date} ${time}`,
      };

      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === 1) {
        this.ws.send(JSON.stringify(chatMessage));
      } else {
        console.log('submit_message_this.ws.readyState: ', this.ws.readyState);
        this.ws = new WebSocket(this.url);
        this.initLoginForm();
        this.initWsHandlers();
      }

      widgetChatForm.reset();
    });
  }

  showChatMessage() {
    if (this.WsServerMessages.type !== 'message') return;
    const messageBoard = this.container.querySelector('[data-id=chat-messages]');
    if (!messageBoard) return;

    let nickname;
    let currentUserMessageClass = '';
    if (this.WsServerMessages.nickname === this.currentUser) {
      nickname = 'You';
      currentUserMessageClass = 'user_message';
    } else {
      nickname = this.WsServerMessages.nickname;
    }
    const chatMessageTextHtml = `
      <div data-id="chat-message-text" class="${currentUserMessageClass} chat_message_text">      
      <span>${nickname}, ${this.WsServerMessages.datestamp}</span>
      <p>${this.WsServerMessages.message}</p>
      </div>
    `;
    messageBoard.insertAdjacentHTML('beforeEnd', chatMessageTextHtml);
  }

  initUsersList() {
    if (this.WsServerMessages.type !== 'loginSuccess') return;
    const chatUsersList = this.container.querySelector('[data-id=clients-list]');
    if (!chatUsersList) return;
    chatUsersList.innerHTML = '';
    let nickname;
    let currentUserCardClass = '';
    this.WsServerMessages.data.forEach((chatUser) => {
      if (chatUser === this.currentUser) {
        nickname = 'You';
        currentUserCardClass = 'current_user_card';
      } else {
        nickname = chatUser;
      }

      const chatUsersListHtml = `
          <div data-id="clients-list-card" class="${currentUserCardClass} clients_list_card">
            <div data-id="clients-list-card-icon" class="clients_list_card_icon">
            </div>
            <div data-id="clients-list-card-nickname" class="clients_list_card_nickname">
            <p>${nickname}</p>
            </div>
          </div>
          `;

      chatUsersList.insertAdjacentHTML('beforeEnd', chatUsersListHtml);
    });
  }

  loadChatMessagesHistory() {
    if (this.WsServerMessages.type !== 'loginSuccess') return;
    if (!this.WsServerMessages.history.length) return;
    const messageBoard = this.container.querySelector('[data-id=chat-messages]');
    if (!messageBoard) return;
    this.WsServerMessages.history.forEach((chatMessage) => {
      const chatMessageTextHtml = `
      <div data-id="chat-message-text" class="chat_message_text">
      <span>${chatMessage.nickname}, ${chatMessage.datestamp}</span>
      <p>${chatMessage.message}</p>
      </div>
      `;
      messageBoard.insertAdjacentHTML('beforeEnd', chatMessageTextHtml);
    });
  }

  addNewChatUser() {
    if (this.WsServerMessages.type !== 'newUserLogged') return;
    const chatUsersList = this.container.querySelector('[data-id=clients-list]');
    if (!chatUsersList) return;
    let nickname;
    if (this.WsServerMessages.message === this.currentUser) {
      nickname = 'You';
    } else {
      nickname = this.WsServerMessages.message;

      const chatUsersListHtml = `
        <div data-id="clients-list-card" class="clients_list_card">
          <div data-id="clients-list-card-icon" class="clients_list_card_icon">
          </div>
          <div data-id="clients-list-card-nickname" class="clients_list_card_nickname">
          <p>${this.WsServerMessages.message}</p>
          </div>
        </div>
        `;

      chatUsersList.insertAdjacentHTML('beforeEnd', chatUsersListHtml);
    }

    this.addUserStateString(nickname, 'joined');
  }

  removeChatUser() {
    if (this.WsServerMessages.type !== 'userLogout') return;
    const chatText = this.container.querySelector('[data-id=chat-messages]');
    if (chatText) this.addUserStateString(this.WsServerMessages.nickname, 'left');

    const chatUsersList = this.container.querySelector('[data-id=clients-list]');
    // console.log('chatUsersList: ', chatUsersList);
    if (!chatUsersList) return;
    const chatUsersListCards = chatUsersList.querySelectorAll('[data-id=clients-list-card]');
    chatUsersListCards.forEach((card) => {
      if (card.innerText === this.WsServerMessages.nickname) card.remove();
    });
  }

  addUserStateString(nickname, status) {
    const chatText = this.container.querySelector('[data-id=chat-messages]');
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    const chatStatusTextHtml = `
    <div data-id="chat-join-text" class="chat_join_text">      
    ${nickname} ${status} this chat @${date} ${time}
    </div>
    `;

    chatText.insertAdjacentHTML('beforeEnd', chatStatusTextHtml);
  }

  parseWsServerMessages(serverMessage) {
    try {
      this.WsServerMessages = JSON.parse(serverMessage.data);
    } catch (e) {
      console.log('e: ', e);
    }
  }
}

const chat = new WsChatApp();
chat.initLoginForm();
