/**
 *
 * Affiche une modal message ou confirm
 *
 * @param {string} dialogType "confirm" | "message"
 * @param {string} title le titre à afficher
 * @param {string} text le texte à afficher
 * @param {string} btnOk le texte du bouton ok à afficher
 * @param {function} functionOk fonction à exécuter au click du btn ok
 */
function messageDialog(dialogType, title, text, btnOk, functionOk) {
	let btnCancel = "";
	if (dialogType === "confirm") {
		btnCancel = `<button class="message-dialog-btn-no btn-primary float-right mt-2"  type="button">Annuler</button>`;
	}
	// append child la fenêtre
	let modal = `<div id="message_dialog" class="container-message-dialog">
                        <div class="message-dialog flex flex-col">
                        <div class="message-dialog-title text-xl font-semibold p-10 bg-jaune">${title}</div>
                        <div class="message-dialog-content pl-10 pt-4 flex-grow">${text}</div>
                        <div class="message-dialog-footer pb-4 pr-4 flex items-center justify-end">
                            ${btnCancel}
                            <button class="message-dialog-btn-yes btn-primary float-right mt-2 ml-2"  type="button">${btnOk}</button>
                        </div>
                        </div>
                    </div>`;

	document.querySelector("body").insertAdjacentHTML("beforeend", modal);
	let modalElement = document.getElementById("message_dialog");
	// btn non supprimer la fenetre modal
	let messageDialogBtnNo = document.querySelector(".message-dialog-btn-no");
	if (messageDialogBtnNo) {
		messageDialogBtnNo.addEventListener("click", () => {
			document.querySelector("body").removeChild(modalElement);
			// todo supprimer eventlistener
			//messageDialogBtnNo.removeEventListener("click");
		});
	}
	//btn oui supprimer la fenetre modal et exécuter la function demmandée en paramètre
	let messageDialogBtnYes = document.querySelector(".message-dialog-btn-yes");
	messageDialogBtnYes.addEventListener("click", () => {
		document.querySelector("body").removeChild(modalElement);
		functionOk();
		// todo supprimer eventlistener
		//messageDialogBtnYes.removeEventListener("click");
	});
}
