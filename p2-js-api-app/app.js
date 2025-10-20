import { getRGB } from './utils.js';

const presets = {
  workout: [
    'Running',
    'Cycling',
    'Swimming',
    'Weights',
    'Boxing',
    'Jump Rope'
  ]
}

const options = [];

// Preset
async function loadPreset() {
  const presetSelect = document.getElementById('presets');
  const selectedPreset = presetSelect.value;
  console.log('Loading preset:', selectedPreset, 'Options count:', options.length);

  try {
    clearOptions();

    if (selectedPreset === 'custom') {
      const savedOption = localStorage.getItem('spinomoCustomPreset');

      if (!savedOption) {
        alert('No custom preset saved yet!');
        return;
      }

      const optionsToLoad = JSON.parse(savedOption);
      for (const option of optionsToLoad) {
        await addPresetOption(option);
      }
    }
    else if (selectedPreset === 'workout') {
      for (const option of presets.workout) {
        await addPresetOption(option);
      }
    }

    displayOptions();

    if (options.length > 0 ) {
      alert('Preset loaded succesfully');
    }
  }
  catch (error) {
    console.error('Error loading preset:', error);
    alert('Failed to load preset');
  }
}


function savePreset() {
  if (options.length === 0) {
    alert(`No options to save`);
    return;
  }

  const optionsToSave = options.map(opt => opt.text);
  localStorage.setItem('spinomoCustomPreset', JSON.stringify(optionsToSave));
  alert('Custom set saved successfully!');
}

// Functions for Input option
async function addOption(inputID) {
  let inputElement = document.getElementById(inputID);
  const value = inputElement.value.trim();

  if (value && options.length < 10 && !options.some(option => option.text === value)) {
    const color = await getRGB();
    options.push({ text: value, color });
    inputElement.value = '';
    displayOptions();
    drawWheel();
    inputElement.focus();
  }
  else if (!value) {
    alert('Please enter a valid option.');
    inputElement.focus();
  }
  else if (options.some(option => option.text === value)) {
    alert("You can't add the same option twice :(")
    inputElement.value = '';
    inputElement.focus();
  }
  else if (options.length >= 10) {
    alert('Sorry you can only add up to 10 options :(');
    inputElement.focus();
  }
}

async function displayOptions() {
  const optionsList = document.getElementById('optionsList');
  optionsList.innerHTML = '';

  
  for (const option of options) {
    const li = document.createElement('li');
    li.className = 'optionItem';
    const text = document.createTextNode(option.text);
    li.appendChild(text);

    try {
      li.style.backgroundColor = 'transparent';
    }
    catch (error) {
      console.error('Error fetching RGB values:', error);
    }
    

    const button = document.createElement('button');
    button.textContent = 'X';
    button.addEventListener('click', () => removeOption(option.text));
    button.className = 'remove-option-button';
    
    li.appendChild(button);
    optionsList.appendChild(li);
    console.log('Options: ', options);
  }
}

async function addPresetOption(option) {
  const optionList = document.getElementById('optionsList');
  const li = document.createElement('li');
  li.className = 'optionItem loading';
  li.textContent = option;

  try {
    const color = await getRGB();
    options.push({text: option, color });
    drawWheel();
  }
  catch (error) {
    console.error('Error fetching RGB values:', error);
  }

  const button = document.createElement('button');
  button.textContent = 'X';
  button.addEventListener('click', () => {
    removeOption(option);
  });
  button.className = 'remove-option-button';

  li.appendChild(button);
  optionList.appendChild(li); 
}

function clearOptions() {
  options.length = 0;
  displayOptions();
  drawWheel();
}

function removeOption(optionText) {
  const index = options.findIndex(opt => opt.text === optionText)
  if (index > -1) {
    options.splice(index, 1);
    displayOptions();
    drawWheel();
  }
}

// Wheel

const wheel = document.getElementById('wheel');
const context = wheel.getContext('2d');

async function drawWheel() {
  context.clearRect(0, 0, wheel.width, wheel.height);
  if (options.length === 0) return;

  const eachAngle = 2 * Math.PI / options.length;
  const centerX = wheel.width / 2;
  const centerY = wheel.height / 2;
  const radius = Math.min(centerX, centerY);
  

  const colors = [];
  for (let i = 0; i < options.length; i++) {
    const { text, color } = options[i];
    const startAngle = i * eachAngle;
    const endAngle = startAngle + eachAngle;
    colors.push(color);
    const textAngle = startAngle + eachAngle / 2;

    context.beginPath();
    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, radius, startAngle, endAngle); 
    context.fillStyle = color;
    context.fill();

    context.save();
    context.translate(centerX, centerY);
    context.rotate(textAngle);
    context.textAlign = 'center';
    context.fillStyle = 'black';
    context.font = '16px Arial';
    context.fillText(text, radius * 0.65, 0);
    context.restore();
  }
}

const spinSound = new Audio('sounds/spinsounds.mp3')
const winnerSound = new Audio('sounds/winnersound.mp3')
spinSound.volume = 0.1;
let currentRotation = 0;
function spin() {
  spinSound.play();
  if (options.length === 0) {
    alert('Add some option first');
    return;
  }
  // Random color
  const fullSpins = Math.floor(Math.random() * 5) + 5;
  const anglePerOption = 360 / options.length;
  // Spin unpredictable
  const extraAngle = Math.random() * 360;
  
  const totalRotation = fullSpins * 360 + extraAngle;

  currentRotation += totalRotation;

  const wrapper = document.querySelector('.wheel-wrapper');
  wrapper.style.transition = 'transform 3s ease-out';
  wrapper.style.transform = `rotate(${currentRotation}deg)`;

  
  setTimeout(() => {
    const normalRotate =  currentRotation % 360;
    const pointerAngle = (360 - normalRotate + anglePerOption / 2 ) % 360;
    const indexAtPointer = Math.floor(pointerAngle / anglePerOption);

    const result = options[indexAtPointer];
    document.getElementById('result').textContent = `You got: ${result.text}! 🚀`;

    winnerSound.play();
  }, 3000);
}

window.addOption = addOption;
window.clearOptions = clearOptions;
window.removeOption = removeOption;
window.displayOptions = displayOptions;
window.spin = spin;
window.savePreset = savePreset;
window.loadPreset = loadPreset;