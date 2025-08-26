// Listen for changes on any militaryBranchCode radio and clear selection of militaryRankCode radios
document.addEventListener('DOMContentLoaded', function () {
  document
    .querySelectorAll('input[name="militaryBranchCode"]')
    .forEach(radio =>
      radio.addEventListener('change', () =>
        document.querySelectorAll('input[name="militaryRankCode"]').forEach(r => (r.checked = false)),
      ),
    )
})
