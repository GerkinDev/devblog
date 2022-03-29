const rewriteIncludedFile = (highlightBlock: HTMLElement) => {
	const section = highlightBlock.parentElement;
	const label = section.getAttribute('data-label');
	const codeContainer = highlightBlock.querySelector('.chroma td:nth-child(2) code');
	if(!codeContainer){
		return console.warn('Can\'t get code container', highlightBlock);
	}
	codeContainer.setAttribute('data-lang', label);
}
const rewriteHighlightBlock = (highlightBlock: HTMLElement) => {
	if(highlightBlock.parentElement?.classList.contains('included-file')){
		rewriteIncludedFile(highlightBlock)
	}
}

Array.from( document.querySelectorAll<HTMLElement>( '.highlight' ))
	.forEach(rewriteHighlightBlock);
