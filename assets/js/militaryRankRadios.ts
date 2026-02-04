// Listen for changes on any militaryBranchCode radio and clear selection of militaryRankCode radios
document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelectorAll<HTMLInputElement>('input[name="militaryBranchCode"]')
    .forEach(radio =>
      radio.addEventListener('change', () =>
        document.querySelectorAll<HTMLInputElement>('input[name="militaryRankCode"]').forEach(r => (r.checked = false)),
      ),
    )
})
