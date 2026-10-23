# Scout: come metterla su GitHub

Tempo: circa 10 minuti, anche da telefono. Serve solo un account GitHub gratuito.

## 1. Crea lo spazio per l'app
1. Vai su **github.com** e registrati (o accedi).
2. Tocca **+** in alto, poi **New repository**.
3. Come nome scrivi **scout**. Lascia **Public** e tocca **Create repository**.

## 2. Carica i file
1. Nella pagina del repository tocca **uploading an existing file** (oppure **Add file → Upload files**).
2. Carica questi 8 file, tutti insieme e senza cartelle:
   `index.html`, `sw.js`, `manifest.webmanifest`, `qr.js`, `jsqr.js`, `icon-180.png`, `icon-192.png`, `icon-512.png`
3. Tocca **Commit changes**.

## 3. Accendi il sito
1. Vai su **Settings → Pages**.
2. In **Source** scegli **Deploy from a branch**; in **Branch** scegli **main** e **/ (root)**, poi **Save**.
3. Dopo 1 o 2 minuti l'app è online a questo indirizzo:
   **https://TUONOMEUTENTE.github.io/scout/**

## 4. Installala (importante)
- **iPhone:** apri il link con Safari, tocca Condividi (il quadrato con la freccia) e scegli **Aggiungi alla schermata Home**.
- **Android:** apri il link con Chrome, menu con i tre puntini, **Installa app**.
- **PC:** apri il link con Chrome o Edge; nella barra degli indirizzi compare l'icona per installarla. Funziona anche senza installarla.

Da quel momento aprila sempre dall'icona: si apre come un'app, funziona senza rete e il dispositivo non le cancella i dati.

Su iPhone i dati di Safari e quelli dell'app sulla Home sono separati: installala **prima** di iniziare a segnare.

## Come si usa, in breve
- **Scout:** in alto scegli chi attacca. Campo **blu** = attaccano loro, campo **arancio** = attaccate voi. Poi numero, colpo ed esito, in qualsiasi ordine: si salva da solo.
- **Analisi:** *Loro* (chi è pericolosa e come difendere), *Noi* (cosa funziona e cosa evitare), *Confronto* (dove fate punto nel loro campo e dove lo fanno loro nel vostro).
- **Squadra:** numeri, nomi e ruoli delle tue giocatrici. Il Libero non compare tra chi attacca.
- **Dati:** QR, codice testuale, backup completo, tabella per Excel.
- **Da PC:** numero di maglia sulla tastiera, poi **P** punto, **D** difesa, **M** murata, **E** errore. **L** e **N** cambiano lato, **Ctrl+Z** annulla.

## Passare i dati tra due telefoni
**Dati → Mostra QR** sul primo, **Dati → Scansiona** sul secondo. La scansione va fatta dentro l'app, non con la fotocamera del telefono: su iPhone la fotocamera aprirebbe Safari, che ha una memoria separata dall'app installata.

Se lo stesso match lo scoutate in due (una per lato), alla fine unite i dati con il QR: gli attacchi già presenti non vengono duplicati.

## Aggiornare l'app
Carica i file nuovi sopra i vecchi (**Add file → Upload files**, stessi nomi). I telefoni vedono la nuova versione alla seconda apertura con rete: la prima scarica, la seconda la usa. I dati non si toccano: alla prima apertura vengono copiati nel nuovo formato e la copia vecchia resta dov'era.

Aggiorna tutti i telefoni che si scambiano dati. Le versioni vecchie leggono ancora i codici delle partite con sole avversarie, ma non quelli che contengono gli attacchi della tua squadra.

## Abitudine che ti salva la stagione
A fine partita: **Dati → Salva la partita come testo** e mandati il messaggio su WhatsApp. È il salvataggio: se perdi o cambi telefono, incolli il messaggio e ritrovi tutto. Prima di cambiare telefono fai anche il **Backup completo**, che contiene la tua squadra.

## Crediti
Codici QR generati con [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (licenza MIT) e letti con [jsQR](https://github.com/cozmo/jsQR) (licenza Apache 2.0).
