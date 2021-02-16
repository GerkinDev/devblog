const VAR_MATCH_RE = /\{\{\s*(\w+((?:\.\w+|\[\d+\]))*?)\s*\}\}/g;

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

const DATA_HREF_ORIGINAL = 'data-href-original';
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
	const codeBlock = label.querySelector(':scope > code');
	const name = label.getAttribute('data-var');
	const parentLink: HTMLAnchorElement = findParentMatching<HTMLAnchorElement>(label, el => el.tagName === 'A');
	if(parentLink){
		parentLink.setAttribute(DATA_HREF_ORIGINAL, decodeURI(parentLink.href));
	}
	return {
		name,
		parentLink,
		codeBlock,
		inputName: `var#${name}`,
		segments: name.split('.'),
		id: label.getAttribute('for'),
	}
}

const findParentMatching = <T extends Element>(el: Element, assert: ((el: Element) => el is T) | ((el: Element) => boolean)) => {
	while (el != undefined && el != null && el.tagName.toUpperCase() != 'BODY'){
		if (assert(el)){
			return el;
		}
		el = el.parentElement;
	}
}

// From https://stackoverflow.com/a/38504572/4839162
const isChild = (obj: Element, parentObj: Element) => !!findParentMatching(obj, el => el === parentObj);

const hideSwitch = document.getElementById('visible-help') as HTMLInputElement;
const helpContainer = document.querySelector<HTMLElement>('.walkthrough-help');
if(helpContainer) {
	if(hideSwitch){
		hideSwitch.addEventListener('change', e => {
			if (hideSwitch.checked) {
				fadeIn(helpContainer, 200);
			} else {
				fadeOut(helpContainer, 200);
			}
		})
	}

	const varInputChangeFactory = (varName: string, input: HTMLInputElement) => {
		const varInstances = varsElements.filter(ve => ve.name === varName);
		const varData = varInstances[0];
		if(!varData){
			throw new Error('No sample var data');
		}
		const setVarInstancesText = (text: string) => {
			text = text || `{{${varName}}}`;
			varInstances.forEach(vi => {
				vi.codeBlock.innerHTML = text;
				if(vi.parentLink) {
					const originalHref = vi.parentLink.getAttribute(DATA_HREF_ORIGINAL);
					VAR_MATCH_RE.lastIndex = 0;
					vi.parentLink.href = originalHref.replace(VAR_MATCH_RE, (fullmatch, varName) => {
						const varDesc = vars.find(v => v.name === varName);
						return (document.getElementById(varDesc.id) as HTMLInputElement).value;
					});
				}
			});
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

	const varsElements = Array
		.from(document.querySelectorAll<HTMLElement>('label.var'))
		.filter(v => !isChild(v, helpContainer))
		.map(rewrapVarLabel)
		.filter((v): v is Exclude<ReturnType<typeof rewrapVarLabel>, undefined> => !!v);
	const vars = varsElements
		.filter((value, index, self) => self.findIndex(value2 => value2.name === value.name) === index)
		.sort((a, b) => a.name.localeCompare(b.name));

	if(vars.length > 0){
		const varsContainer = document.getElementById('vars-container');
		if(varsContainer){
			vars.forEach(v => {
				const targetContainer = v.segments.reduce((acc, segment) => {
					const segmentChild = acc.querySelector<HTMLElement>(`:scope > [data-scope="${segment}"]`);
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
				
				const input = targetContainer.querySelector<HTMLInputElement>(`input#${v.id}`);
				const onChange = varInputChangeFactory(v.name, input);
				input.addEventListener('change', onChange);
				input.addEventListener('keyup', onChange);
			})
		}
	}
}