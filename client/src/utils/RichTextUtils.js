// Rich Text
import { stateToHTML } from 'draft-js-export-html';
import { convertFromHTML, ContentState, convertToRaw } from 'draft-js';
import ReactHtmlParser from 'react-html-parser';

// HTML to DraftJS
export const htmlToDraftContent = (value) => {
  if (value) {
    // 1. Convert the HTML
    //const contentHTML = convertFromHTML(value);

    // 2. Create the ContentState object
    //const state = ContentState.createFromBlockArray(contentHTML/*.contentBlocks*/, contentHTML.entityMap);

    // 3. Stringify `state` object from a Draft.Model.Encoding.RawDraftContentState object
    //return JSON.stringify(convertToRaw(state));

    return value;
  }
};

// DraftJS to HTML
export const draftToHtmlContent = (value) => {
  //return stateToHTML(value.getCurrentContent());
  if (value)
    return value;
  else
    return "";
};

// HTML string to HTML
export const displayHtml = (value) => {
  if (value)
    return ReactHtmlParser(value);
  else
    return "";
}