export default function (s) {
  var div = document.createElement('div')
  var scripts; var i

  div.innerHTML = s

  scripts = div.getElementsByTagName('script')

  for (i = scripts.length - 1; i >= 0; i--) {
    scripts[i].parentNode.removeChild(scripts[i])
  }

  scripts = div.getElementsByTagName('style')

  for (i = scripts.length - 1; i >= 0; i--) {
    scripts[i].parentNode.removeChild(scripts[i])
  }

  return div.innerHTML
}
