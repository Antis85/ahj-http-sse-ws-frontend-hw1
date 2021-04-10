// const port = 7070;// for devserver  work
// const serverUrl = `http://localhost:${port}`;// for devserver  work
// const serverUrl = 'https://ahj-hw-sse-ws.herokuapp.com/';
// const websocketUrl = `ws://localhost:${port}/ws`;

class WsChatApp {
  constructor() {
    this.url = 'ws://localhost:7070/ws';
    this.container = document.querySelector('.main_container');
    this.currentUser = undefined;
    this.ws = new WebSocket(this.url);
    this.initLoginForm();

    this.ws.addEventListener('open', () => {
      console.log('ws_connected');
      console.log('ws.readyState_open_event: ', this.ws.readyState);
    });
    //  logout users
    this.ws.addEventListener('message', (evt) => {
      // console.log('from server: evt.data', evt.data);
      // console.log('ws.readyState_in_message_event: ', this.ws.readyState);
      let jsonMsg;
      try {
        // console.log('JSON.parse(msg): ', JSON.parse(evt.data));
        jsonMsg = JSON.parse(evt.data);
      } catch (e) {
        console.log('e: ', e);
        console.log('e.name: ', e.name);
      }

      if (!jsonMsg) return;
      // console.log('from_server_msg: ', jsonMsg);
      // console.log('from_server_msg.message: ', jsonMsg.message);
      console.log('from_server_msg.type: ', jsonMsg.type);

      if (jsonMsg.type !== 'userLogout') return;

      const chatText = this.container.querySelector('[data-id=chat-messages]');
      if (chatText) {
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();
        const chatExitTextHtml = `
        <div data-id="chat-join-text" class="chat_join_text">      
        ${jsonMsg.nickname} has exit chat @${date} ${time}
        </div>
        `;
        chatText.insertAdjacentHTML('beforeEnd', chatExitTextHtml);
      }

      const chatUsersList = this.container.querySelector('[data-id=clients-list]');
      console.log('chatUsersList: ', chatUsersList);
      if (!chatUsersList) return;
      chatUsersList.innerHTML = '';
      jsonMsg.data.forEach((name) => {
        if (name === this.currentUser) {
          const username = 'You';
          const chatUsersListHtml = `
            <div data-id="clients-list-card" class="current_user_card clients_list_card">
              <div data-id="clients-list-card-icon" class="clients_list_card_icon">
              </div>
              <div data-id="clients-list-card-nickname" class="clients_list_card_nickname">
              <p>${username}</p>
              </div>
            </div>
            `;

          chatUsersList.insertAdjacentHTML('beforeEnd', chatUsersListHtml);
        } else {
          const chatUsersListHtml = `
            <div data-id="clients-list-card" class="clients_list_card">
              <div data-id="clients-list-card-icon" class="clients_list_card_icon">
              </div>
              <div data-id="clients-list-card-nickname" class="clients_list_card_nickname">
              <p>${name}</p>
              </div>
            </div>
            `;

          chatUsersList.insertAdjacentHTML('beforeEnd', chatUsersListHtml);
        }
      });
    });
    // new message
    this.ws.addEventListener('message', (evt) => {
      // console.log('from server: evt.data', evt.data);
      // console.log('ws.readyState_in_message_event: ', this.ws.readyState);
      let jsonMsg;
      try {
        // console.log('JSON.parse(msg): ', JSON.parse(evt.data));
        jsonMsg = JSON.parse(evt.data);
      } catch (e) {
        console.log('e: ', e);
        console.log('e.name: ', e.name);
      }

      if (!jsonMsg) return;
      // console.log('from_server_msg: ', jsonMsg);
      // console.log('from_server_msg.message: ', jsonMsg.message);
      console.log('from_server_msg.type: ', jsonMsg.type);
      if (jsonMsg.type !== 'message') return;
      const messageBoard = this.container.querySelector('[data-id=chat-messages]');
      if (!messageBoard) return;
      if (jsonMsg.nickname === this.currentUser) {
        const chatMessageTextHtml = `
        <div data-id="chat-user-message-text" class="chat_message_text user_message">      
        <span>You, ${jsonMsg.datestamp}</span>
        <p>${jsonMsg.message}</p>
        </div>
        `;
        messageBoard.insertAdjacentHTML('beforeEnd', chatMessageTextHtml);
      } else {
        const chatMessageTextHtml = `
        <div data-id="chat-message-text" class="chat_message_text">      
        <span>${jsonMsg.nickname}, ${jsonMsg.datestamp}</span>
        <p>${jsonMsg.message}</p>
        </div>
        `;
        messageBoard.insertAdjacentHTML('beforeEnd', chatMessageTextHtml);
      }
    });
    // new user
    this.ws.addEventListener('message', (evt) => {
      // console.log('from server: evt.data', evt.data);
      // console.log('ws.readyState_in_message_event: ', this.ws.readyState);
      let jsonMsg;
      try {
        // console.log('JSON.parse(msg): ', JSON.parse(evt.data));
        jsonMsg = JSON.parse(evt.data);
      } catch (e) {
        console.log('e: ', e);
        console.log('e.name: ', e.name);
      }

      if (!jsonMsg) return;
      // console.log('from_server_msg: ', jsonMsg);
      // console.log('from_server_msg.message: ', jsonMsg.message);
      console.log('from_server_msg.type: ', jsonMsg.type);
      if (jsonMsg.type !== 'newUserLogged') return;
      const chatUsersList = this.container.querySelector('[data-id=clients-list]');
      console.log('chatUsersList: ', chatUsersList);
      if (!chatUsersList) return;
      if (jsonMsg.data === this.currentUser) return;
      const chatUsersListHtml = `
          <div data-id="clients-list-card" class="clients_list_card">
            <div data-id="clients-list-card-icon" class="clients_list_card_icon">
            </div>
            <div data-id="clients-list-card-nickname" class="clients_list_card_nickname">
            <p>${jsonMsg.data}</p>
            </div>
          </div>
          `;

      chatUsersList.insertAdjacentHTML('beforeEnd', chatUsersListHtml);

      const chatText = this.container.querySelector('[data-id=chat-messages]');
      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();
      const chatJoinTextHtml = `
      <div data-id="chat-join-text" class="chat_join_text">      
      ${jsonMsg.data} has joined chat @${date} ${time}
      </div>
      `;
      chatText.insertAdjacentHTML('beforeEnd', chatJoinTextHtml);
    });
    // login+history
    this.ws.addEventListener('message', (evt) => {
      // console.log('from server: evt.data', evt.data);
      // console.log('ws.readyState_in_message_event: ', this.ws.readyState);
      let jsonMsg;
      try {
        // console.log('JSON.parse(msg): ', JSON.parse(evt.data));
        jsonMsg = JSON.parse(evt.data);
      } catch (e) {
        console.log('e: ', e);
        console.log('e.name: ', e.name);
      }

      if (!jsonMsg) return;
      // console.log('from_server_msg: ', jsonMsg);
      // console.log('from_server_msg.message: ', jsonMsg.message);
      // console.log('from_server_msg.type: ', jsonMsg.type);
      if (jsonMsg.type === 'loginReject') {
        this.container.querySelector('.widget_footer_string').innerHTML = `${jsonMsg.message}`;
        this.container.querySelector('.widget_footer_string').classList.remove('hidden');
        // this.container.querySelector('.widget_footer_string').classList.remove('success');
      }

      if (jsonMsg.type === 'loginSuccess') {
        // this.container.querySelector('.widget_footer_string').innerHTML = `${jsonMsg.message}`;
        // this.container.querySelector('.widget_footer_string').classList.remove('hidden');
        // this.container.querySelector('.widget_footer_string').classList.add('success');

        this.currentUser = jsonMsg.message;
        this.initChat();
        // setTimeout(() => { this.closeLoginForm(); }, 2000);
        this.closeLoginForm();

        const chatUsersList = this.container.querySelector('[data-id=clients-list]');
        // console.log('chatUsersList: ', chatUsersList);
        if (!chatUsersList) return;
        // создание списка при логине себя
        chatUsersList.innerHTML = '';
        jsonMsg.data.forEach((name) => {
          if (name === this.currentUser) {
            const username = 'You';
            const chatUsersListHtml = `
            <div data-id="clients-list-card" class="current_user_card clients_list_card">
              <div data-id="clients-list-card-icon" class="clients_list_card_icon">
              </div>
              <div data-id="clients-list-card-nickname" class="clients_list_card_nickname">
              <p>${username}</p>
              </div>
            </div>
            `;

            chatUsersList.insertAdjacentHTML('beforeEnd', chatUsersListHtml);

            const chatText = this.container.querySelector('[data-id=chat-messages]');
            const date = new Date().toLocaleDateString();
            const time = new Date().toLocaleTimeString();
            const chatJoinTextHtml = `
            <div data-id="chat-join-text" class="chat_join_text">      
            ${username} have joined chat @${date} ${time}
            </div>
            `;

            chatText.insertAdjacentHTML('beforeEnd', chatJoinTextHtml);
          } else {
            const chatUsersListHtml = `
            <div data-id="clients-list-card" class="clients_list_card">
              <div data-id="clients-list-card-icon" class="clients_list_card_icon">
              </div>
              <div data-id="clients-list-card-nickname" class="clients_list_card_nickname">
              <p>${name}</p>
              </div>
            </div>
            `;

            chatUsersList.insertAdjacentHTML('beforeEnd', chatUsersListHtml);
          }
        });

        if (!jsonMsg.history.length) return;
        const messageBoard = this.container.querySelector('[data-id=chat-messages]');
        if (!messageBoard) return;
        console.log('jsonMsg.history: ', jsonMsg.history);
        jsonMsg.history.forEach((message) => {
          const chatMessageTextHtml = `
          <div data-id="chat-message-text" class="chat_message_text">
          <span>${message.nickname}, ${message.datestamp}</span>
          <p>${message.message}</p>
          </div>
          `;
          messageBoard.insertAdjacentHTML('beforeEnd', chatMessageTextHtml);
        });
      }
    });
    // reconnect
    this.ws.addEventListener('close', (evt) => {
      console.log('connection closed', evt);
      console.log('ws.readyState_in_close_event: ', this.ws.readyState);
      if (evt.wasClean) {
        console.log(`Соединение закрыто\n код: ${evt.code},\n причина: ${evt.reason}`);
      } else {
        console.log('connection lost, trying to reconnect');
      //  TODO: reconnect
      }
    });

    this.ws.addEventListener('error', () => {
      console.log('ws.readyState_in_error_event: ', this.ws.readyState);
      console.log('error');
    });
  }

  initLoginForm() {
  // if active modal has already exist - return
    if (this.container.querySelector('.modal_active')) return;
    //  login modal window
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
      console.log('nickname: ', inputName);

      const loginMessage = {
        type: 'login',
        nickname: inputName,
      };
      this.ws.send(JSON.stringify(loginMessage));
      console.log('form_submited&sent');
      //  TODO: проверка на то, что ник свободен
      //  TODO: вход в чат, если ник свободен
      //  TODO: сообщение, если ник НЕ свободен
      widgetLoginForm.reset();
      // widgetLogin.remove();
    });
  }

  closeLoginForm() {
    const widgetLogin = this.container.querySelector('[data-widget=login]');
    widgetLogin.remove();
  }

  initChat() {
  // if active modal has already exist - return
    if (this.container.querySelector('.widget_chat')) return;
    //  chat window
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
      /*
        //  при отправке сообщений нужно проверять состояние:
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('...');
        } else {
          // Reconnect
        }
      */
      console.log('chat_message: ', inputMessage);
      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();
      const chatMessage = {
        type: 'message',
        message: inputMessage,
        nickname: this.currentUser,
        datestamp: `${date} ${time}`,
      };
      console.log('chatMessage: ', chatMessage);
      this.ws.send(JSON.stringify(chatMessage));
      console.log('chatMessage_sent: ', chatMessage);
      widgetChatForm.reset();
    });
  }
}

const chat = new WsChatApp();
