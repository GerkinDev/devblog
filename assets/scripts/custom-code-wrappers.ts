const escapeHtml = (unsafe: string) => {
	return unsafe
	.replace(/&/g, "&amp;")
	.replace(/</g, "&lt;")
	.replace(/>/g, "&gt;")
	.replace(/"/g, "&quot;")
	.replace(/'/g, "&#039;");
}

const copy = ( text: string )=>{
	const textarea = document.createElement( 'textarea' );
	document.body.appendChild( textarea );
	textarea.value = text;
	textarea.select();
	document.execCommand( 'copy' );
	document.body.removeChild( textarea );
};

const getIncludedFileCode = ( detailsBlock: HTMLDetailsElement ) => {
	const text = detailsBlock.querySelector<HTMLElement>(':scope > .collapse')!.innerText;
	return text;
};

const bindCopyButton = (btn: HTMLButtonElement, file: string | false) => {
	const isMicroscript = file && btn.classList.contains('microscript');

	const targetCodeElement = btn.parentElement!.parentElement!.querySelector<HTMLElement>(':scope > .highlight');
	const postProcessFn = isMicroscript ?
		(text: string) => `cat <<< EOF > ${file}\n${text}\nEOF` :
		(text: string) => text

	btn.addEventListener( 'click', () => {
		const targetText = targetCodeElement.innerText;
		console.log(targetText);
		copy(postProcessFn(targetText));
	} );
}

const makeCodeFileHeader = (file: string) => {
	return `<b>${escapeHtml(file)}</b>
	<button class="copy content">Content</button>
	<button class="copy microscript">Microscript</button>`
}
const makeCodeBlockHeader = () => {
	return `<b>${escapeHtml('$>')}</b>
	<button class="copy content">Content</button>`
}

const wrapHighlightBlock = (highlightBlock: HTMLElement) => {
	let file: string | false
	if(highlightBlock.parentElement!.classList.contains('included-file')){
		file = highlightBlock.parentElement!.getAttribute('data-file');
	}
	
	const details = document.createElement('details');
	details.classList.add('code-details');
	details.setAttribute('open', '');
	const summaryContent = file ?
		makeCodeFileHeader(file) :
		makeCodeBlockHeader();
	details.innerHTML = `<summary>${summaryContent}</summary>
	${highlightBlock.outerHTML}`;
	
	highlightBlock.replaceWith(details);
	
	Array.from(details.querySelectorAll<HTMLButtonElement>('.copy'))
		.forEach(btn => bindCopyButton(btn, file))
}

type MetaCodeBlock = {content: HTMLElement; file: string | false;}

const highlightBlocks = Array.from( document.querySelectorAll( '.highlight' ));
const highlightBlocksMeta = highlightBlocks
    .forEach(wrapHighlightBlock);
