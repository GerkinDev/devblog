Array.from( document.querySelectorAll<HTMLElement>( '[data-code-block-label-override]' ))
	.forEach(element => {
		const codeContainer = element.querySelector('.chroma td:nth-child(2) code');
		const label = element.getAttribute('data-code-block-label-override');
		codeContainer.setAttribute('data-lang', label);
	});
