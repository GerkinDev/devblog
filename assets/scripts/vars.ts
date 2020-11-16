const VAR_MATCH_RE = /\{\{\s*(\S+?)\s*\}\}/g;

declare function fadeIn(el: HTMLElement, time: number): void;
declare function fadeOut(el: HTMLElement, time: number): void;

// See https://github.com/padolsey/findAndReplaceDOMText
const content = document.querySelector('.single__contents');
if(content){
	(window as any).findAndReplaceDOMText( content, {
		find: VAR_MATCH_RE,
		wrap: 'label',
		wrapClass: 'var',
		// preset: 'prose'
		portionMode: 'first',
	});
}

const rewrapVarLabel = (label: HTMLElement) => {
	VAR_MATCH_RE.lastIndex = 0;
	const innerMatch = VAR_MATCH_RE.exec(label.innerText);
	if(!innerMatch){
		label.parentElement.removeChild(label);
		return undefined;
	}
	const varName = innerMatch[1];
	const id = varName.replace(/\./g, '--');
	label.innerHTML = `<code>{{` + varName.trim() + '}}</code>';
	label.setAttribute('data-var', varName);
	label.setAttribute('title', `Var name: "${varName}"`);
	label.setAttribute('for', id)
	const name = label.getAttribute('data-var');
	return {
		name,
		inputName: `var#${name}`,
		segments: name.split('.'),
		id: label.getAttribute('for'),
	}
}

const varInputChangeFactory = (varData: ReturnType<typeof rewrapVarLabel>, input: HTMLInputElement) => {
	const varInstances = Array.from(document.querySelectorAll(`.var[data-var="${varData.name}"] > code`));
	const setVarInstancesText = (text: string) => {
		text = text || `{{${varData.name}}}`;
		varInstances.forEach(vi => vi.innerHTML = text);
	}
	
	const storedValue = localStorage.getItem(varData.inputName)?.trim();
	if(storedValue){
		input.value = storedValue;
		setVarInstancesText(storedValue);
	}
	return () => {
		const val = input.value.trim();
		
		setVarInstancesText(val);
		if(val){
			localStorage.setItem(varData.inputName, val);
		} else {
			localStorage.removeItem(varData.inputName);
		}
	};
}

const vars = Array
	.from(document.querySelectorAll<HTMLElement>('label.var'))
	.map(rewrapVarLabel)
	.filter((v): v is Exclude<ReturnType<typeof rewrapVarLabel>, undefined> => !!v)
	.filter((value, index, self) => self.findIndex(value2 => value2.name === value.name) === index)
	.sort((a, b) => a.name.localeCompare(b.name));

if(vars.length > 0){
	const tempSidebar = document.querySelector('.wrapper__right').cloneNode(true) as HTMLElement;
	// Remove TOC
	const oldToc = tempSidebar.querySelector('#TableOfContents');
	if(oldToc){
		oldToc.parentElement.removeChild(oldToc);
	}
	document.getElementById('container').appendChild(tempSidebar);
	// Edit
	tempSidebar.id = 'vars-container'
	tempSidebar.outerHTML = tempSidebar.outerHTML.replace(/right/g, 'left');

	const newSidebar = document.getElementById('vars-container')

	// Update
	const newSidebarTitle = newSidebar.querySelector('.toc__title');
	if(newSidebarTitle){
		newSidebarTitle.innerHTML = 'Vars editor';
	}
	const hideSwitch = newSidebar.querySelector<HTMLInputElement>('.switch > input');
	if(hideSwitch){
		hideSwitch.id = 'visible-vars-editor';
		hideSwitch.setAttribute('aria-label', 'Visible var editor');
		hideSwitch.addEventListener('change', e => {
			if (varsContainer) {
				if (hideSwitch.checked) {
					fadeIn(varsContainer, 200);
				} else {
					fadeOut(varsContainer, 200);
				}
			}
		})
	}
	const varsContainer = newSidebar.querySelector<HTMLElement>('.toc');
	if(varsContainer){
		vars.forEach(v => {
			const targetContainer = v.segments.reduce((acc, segment, index) => {
				const segmentChild = acc.querySelector(`[data-scope="${segment}"]`);
				if(segmentChild){
					return segmentChild;
				}
				const newSegmentChild = document.createElement('div');
				newSegmentChild.classList.add('vars-category');
				newSegmentChild.setAttribute('data-scope', segment);
				newSegmentChild.innerHTML = `<label class="vars-category-label">${segment}</label>`
				acc.appendChild(newSegmentChild);
				return newSegmentChild;
			}, varsContainer);
			
			targetContainer.innerHTML = targetContainer.innerHTML + `<input class="var-input" type="text" name="${v.inputName}" id="${v.id}"/>`;
			const label = targetContainer.querySelector('.vars-category-label')!;
			label.setAttribute('for', v.id);
			
			const input = targetContainer.querySelector('input');
			const onChange = varInputChangeFactory(v, input);
			input.addEventListener('change', onChange);
			input.addEventListener('keyup', onChange);
		})
	}
}