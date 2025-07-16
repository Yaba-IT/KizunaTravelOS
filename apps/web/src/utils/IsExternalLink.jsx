import React from 'react'

export function IsExternalLink(url) {
  try {
    const link = new URL(url, window.location.origin);
    return link.origin !== window.location.origin;
  } catch (e) {
    return false;
  }
}
