document.getElementById('convert').addEventListener('click', async () => {
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	chrome.scripting.executeScript({
	target: { tabId: tab.id },
	function: convertPage,
	});
});

function convertPage() {
	function convertText(inputText) {
		const words = [''];

		let wordPointer = 0;
		let inWord = true;
		let tagCount = 0;

		for (let charPointer = 0; charPointer < inputText.length; charPointer++) {
		    const char = inputText[charPointer];

		    if (char == '<') {
		    	tagCount++;
		    }

		    const isWordChar = (char.match(/[a-zA-Z]/) !== null && tagCount == 0);

		    if (inWord == isWordChar) {
		        words[wordPointer] += char;
		    } else {
	        	wordPointer++;
	        	inWord = isWordChar;
		        words[wordPointer] = char;
		    }


		    if (char == '>') {
		    	tagCount--;
		    }

		}

		const convertedWords = words.map((word, index) => {
		        if (word.match(/^[a-zA-Z]+$/)) {
		            let numBoldLetters = 0;

		            if (word.length <= 3) {
		                numBoldLetters = 1;
		            } else if (word.length === 4) {
		                numBoldLetters = 2;
		            } else if (word.length > 4) {
		                numBoldLetters = Math.ceil(word.length * 0.50);
		            }

		            let letters = word.split('');
		            letters.splice(0, 0, "<b>");
		            letters.splice(numBoldLetters + 1, 0, "</b>");
		            return letters.join('');
		        }

		        return word;
		    });

		    let outputText = convertedWords.join('');
		    outputText = outputText.replace(/(?:\r\n|\r|\n)/g, '<br>');

		    return outputText;
	}

	document.querySelectorAll('span,p').forEach(span => {
	  span.innerHTML = convertText(span.innerHTML);
	});

	let styleTag = document.createElement("style");
	styleTag.innerHTML = 'b { font-weight: 700 !important; }';
    document.body.appendChild(styleTag);
}
