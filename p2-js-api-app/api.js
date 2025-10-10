export async function getRandomNumber(min = 0, max =  255) {
  const url = `https://randomnumber-one.vercel.app/number?min=${min}&max=${max}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) throw new Error(data);
    
    return data;
  }
  catch (error) {
    console.error('Error fetching random number:', error);
    throw error;
  }
}

export async function getRGB() {
  const ranges = {
    red: {min: 155, max: 255},
    green: {min: 165, max: 246},
    blue: {min: 165, max: 255}
  };

  try {
    const red = await getRandomNumber(ranges.red.min, ranges.red.max);
    const green = await getRandomNumber(ranges.green.min, ranges.green.max);
    const blue = await getRandomNumber(ranges.blue.min, ranges.blue.max);
    return `rgb(${red.value}, ${green.value}, ${blue.value})`;
  }
  catch (error) {
    console.error('Error fetching RGB values:', error);
    throw error;
  }
}

const test = await getRGB();
console.log(test);