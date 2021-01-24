export default function (from, to, attrs) {
  for (var i = attrs.length - 1; i >= 0; i--) {
    to[attrs[i]] = from[attrs[i]]
  }
}
