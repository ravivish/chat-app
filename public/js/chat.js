const socket = io()

// socket(emit) -> client (receive) --acknowledgement --> server
// client(emit) -> server (receive) --acknowledgement --> client


// here "countupdated" is an event name it must be same as on the server
// socket.on('countupdated',(countRecievd)=>{
//     console.log('The account has been updated',countRecievd);    
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked');
//     socket.emit('increment');
// })

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton =  document.querySelector('#location');
const $messages = document.querySelector('#messages');

// Templates

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix:true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of new Message
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // console.log(newMessageStyle);

    // Visible Height
    const visibleHeight = $messages.offsetHeight;

    // Height of message container
    const containerHeight = $messages.scrollHeight;

    // How far i have scrolled
    const scrollOffset  = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
    
}


socket.on('message',(msg) => {
    console.log(msg);
    const html = Mustache.render(messageTemplate,{
        username:msg.username,
        // message:msg
        message:msg.text,
        // createdAt:msg.createdAt
        createdAt:moment(msg.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('locationMessage',(msg) => {
    const html = Mustache.render(locationMessageTemplate,{
        username:msg.username,
        locate:msg.url,
        createdAt:moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html);
    // console.log(msg.url);
    
})
 

socket.on('roomData',({ room, users }) => {
    // console.log(room);
    // console.log(users);
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })    
    // console.log(html);
    
    document.querySelector('#sidebar').innerHTML = html;
})

// document.querySelector('#message-form').addEventListener('submit',(e)=>{
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();// Stoping to refresh the page while submitting the form.

    // Disable the send button
    $messageFormButton.setAttribute('disabled','disabled');
    
    // const msg = document.querySelector('input').value;
    const msg = e.target.elements.txtbox.value;
    socket.emit('sendMsg',msg,(error)=>{
        // Enable the send button
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if(error){
            return console.log(error);
        }

        // console.log('This msg was deliverd',message);  // send feedback as 'This msg was deliverd' and receive as 'message' variable      

        console.log('Message Deliverd!');
    });  
})

$locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geo location is not supported bu your browser');
    }
    // Disable the location send button
    $locationButton.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position);

        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            // enable the location send button
            $locationButton.removeAttribute('disabled');
            console.log('Location Shared');// Feedback 
            
        })
    }) 
})

socket.emit('join',{ username , room } , (error)=> {
    if(error){
        alert(error);
        location.href = '/'; // '/' to send them to the root page of site
    }
    // feedback
})