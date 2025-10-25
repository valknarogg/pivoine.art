import { css } from "lit";

export const styles = css`
  @media screen {
    input[type='text'] {
      appearance: none;
      border: none;
      outline: none;
      border-bottom: 0.2em solid var(--hm-search-input-color-border, #e91e63);
      background: var(--hm-search-input-color-bg, rgba(233, 30, 99, 0.2));
      border-radius: 0.2em 0.2em 0 0;
      color: var(--hm-search-input-color, #e91e63);
      caret-color: var(--hm-search-input-color-caret, #e91e63);
      font-size: var(--hm-search-font-size, inherit);
      padding: 0.6rem;
    }
  }

  @media print {
    input[type='text'] {
      display: none;
    }
  }
`;
