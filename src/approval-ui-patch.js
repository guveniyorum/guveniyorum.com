function patchSolvedApprovalCards() {
  document.querySelectorAll('.complaint').forEach((card) => {
    const status = card.querySelector('.status')?.textContent?.trim();
    if (status !== 'Çözüldü') return;
    const actions = card.querySelector('.complaintFoot span');
    if (!actions) return;
    actions.querySelectorAll('button').forEach((button) => {
      if (button.textContent.trim() === 'Çözüm Onayı') button.remove();
    });
  });
}

patchSolvedApprovalCards();
new MutationObserver(patchSolvedApprovalCards).observe(document.body, { childList: true, subtree: true });
