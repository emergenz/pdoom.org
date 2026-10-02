/* Country-aware bank fields, copied from the inline script in onboard.html so
   the referral claim form (refer_claim.html) collects exactly the same
   payout_details as participant onboarding. Both are decrypted by the same
   payment code in the lambda (toIntlDetails), so the shape must match.

   onboard.html still has its own inline copy (not yet switched over, to keep
   the live onboarding page untouched). If you change the rules there, change
   them here too, and vice versa. The lambda's validateBankDetails is the
   authority; these checks only catch typos before submit.

   The page must use the same element ids as onboard.html: f-country, f-holder,
   f-iban/l-iban, f-bic/l-bic, f-bank, f-routing, f-account-type,
   f-institution, f-transit, f-bsb, f-bankcode/l-bankcode, f-branchcode,
   f-benaddr-line/-city/-post, and the w-* wrappers around the optional ones.

   Functions take a value accessor get(id) -> string instead of reading the
   DOM directly, so they can be tested outside a browser. */
(function () {
    // IBAN validation (ISO 13616)
    function validateIBAN(iban) {
        iban = iban.replace(/\s+/g, '').toUpperCase();
        if (iban.length < 15 || iban.length > 34) return false;
        if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) return false;

        // Country-specific lengths
        const lengths = {
            AL:28, AD:24, AT:20, AZ:28, BH:22, BY:28, BE:16, BA:20, BR:29, BG:22,
            CR:22, HR:21, CY:28, CZ:24, DK:18, DO:28, TL:23, EE:20, FO:18, FI:18,
            FR:27, GE:22, DE:22, GI:23, GR:27, GL:18, GT:28, HU:28, IS:26, IQ:23,
            IE:22, IL:23, IT:27, JO:30, KZ:20, XK:20, KW:30, LV:21, LB:28, LI:21,
            LT:20, LU:20, MK:19, MT:31, MR:27, MU:30, MC:27, MD:24, ME:22, NL:18,
            NO:15, PK:24, PS:29, PL:28, PT:25, QA:29, RO:24, LC:32, SM:27, SA:24,
            RS:22, SC:31, SK:24, SI:19, ES:24, SE:24, CH:21, TN:24, TR:26, UA:29,
            AE:23, GB:22, VA:22, VG:24,
        };
        const country = iban.substring(0, 2);
        if (lengths[country] && iban.length !== lengths[country]) return false;

        // MOD-97 checksum (ISO 7064)
        const rearranged = iban.substring(4) + iban.substring(0, 4);
        let numStr = '';
        for (const ch of rearranged) {
            if (ch >= '0' && ch <= '9') numStr += ch;
            else numStr += (ch.charCodeAt(0) - 55).toString();
        }
        // BigInt-free mod97
        let remainder = 0;
        for (let i = 0; i < numStr.length; i++) {
            remainder = (remainder * 10 + parseInt(numStr[i])) % 97;
        }
        return remainder === 1;
    }

    // Country-aware bank fields: IBAN countries get a strict IBAN field, the US
    // gets account + routing + account type, India gets account + IFSC, and
    // everyone else gets account + SWIFT.
    const COUNTRY_ISO = {
        'Germany':'DE','United Kingdom':'GB','Switzerland':'CH','Austria':'AT','Netherlands':'NL',
        'France':'FR','Sweden':'SE','Denmark':'DK','Norway':'NO','Finland':'FI','Belgium':'BE',
        'Italy':'IT','Spain':'ES','Portugal':'PT','Poland':'PL','Czech Republic':'CZ','Hungary':'HU',
        'Romania':'RO','Ireland':'IE','Greece':'GR','India':'IN','China':'CN','Japan':'JP',
        'United States':'US','Canada':'CA','Australia':'AU','Israel':'IL','Turkey':'TR',
        'Singapore':'SG','Hong Kong':'HK','South Korea':'KR','Taiwan':'TW','Brazil':'BR',
        'Mexico':'MX','South Africa':'ZA','Armenia':'AM','Nepal':'NP','Ethiopia':'ET',
    };
    const IBAN_COUNTRIES = ['DE','GB','CH','AT','NL','FR','SE','DK','NO','FI','BE','IT','ES','PT','PL','CZ','HU','RO','IE','GR','IL','TR','BR'];

    function bankMode(country) {
        if (!country) return 'default';
        const iso = COUNTRY_ISO[country] || '';
        const modes = { US:'us', IN:'in', CA:'ca', AU:'au', JP:'jp', SG:'sg', HK:'hk', MX:'mx', AM:'am', NP:'np', ET:'et' };
        if (modes[iso]) return modes[iso];
        if (IBAN_COUNTRIES.indexOf(iso) >= 0) return 'iban';
        return 'iban'; // every remaining country in the dropdown uses IBAN
    }

    function setAccountTypeOptions(opts) {
        const sel = document.getElementById('f-account-type');
        const current = sel.value;
        sel.innerHTML = '<option value="">Select...</option>' +
            opts.map(o => '<option value="' + o[0] + '">' + o[1] + '</option>').join('');
        if (opts.some(o => o[0] === current)) sel.value = current;
    }

    function updateBankFields() {
        const mode = bankMode(document.getElementById('f-country').value);
        const lIban = document.getElementById('l-iban');
        const fIban = document.getElementById('f-iban');
        const lBic = document.getElementById('l-bic');
        const fBic = document.getElementById('f-bic');
        const show = (id, on) => { document.getElementById(id).style.display = on ? '' : 'none'; };
        show('w-routing', mode === 'us');
        show('w-institution', mode === 'ca');
        show('w-transit', mode === 'ca');
        show('w-bsb', mode === 'au');
        show('w-bankcode', mode === 'jp' || mode === 'sg' || mode === 'hk');
        show('w-branchcode', mode === 'jp');
        show('w-account-type', mode === 'us' || mode === 'jp');
        show('w-bic', mode === 'in' || mode === 'iban' || mode === 'default' || mode === 'am' || mode === 'np' || mode === 'et');
        show('w-benaddr', mode === 'am' || mode === 'np' || mode === 'et');
        if (mode === 'us') {
            lIban.textContent = 'Account number *';
            fIban.placeholder = 'e.g. 12345678 (4-17 digits)';
            setAccountTypeOptions([['checking','Checking'],['savings','Savings']]);
        } else if (mode === 'in') {
            lIban.textContent = 'Account number *';
            fIban.placeholder = 'e.g. 1234567890';
            lBic.textContent = 'IFSC code *';
            fBic.placeholder = 'e.g. HDFC0001234';
        } else if (mode === 'ca') {
            lIban.textContent = 'Account number *';
            fIban.placeholder = '5-12 digits';
        } else if (mode === 'au') {
            lIban.textContent = 'Account number *';
            fIban.placeholder = '4-10 digits';
        } else if (mode === 'jp') {
            lIban.textContent = 'Account number *';
            fIban.placeholder = '7 digits';
            document.getElementById('l-bankcode').textContent = 'Bank code (銀行コード) *';
            document.getElementById('f-bankcode').placeholder = '4 digits, e.g. 0001';
            setAccountTypeOptions([['savings','Futsu 普通 (ordinary)'],['current','Toza 当座 (current)']]);
        } else if (mode === 'sg') {
            lIban.textContent = 'Account number *';
            fIban.placeholder = 'e.g. 0052312891';
            document.getElementById('l-bankcode').textContent = 'Bank code *';
            document.getElementById('f-bankcode').placeholder = 'e.g. 7171 (DBS)';
        } else if (mode === 'hk') {
            lIban.textContent = 'Account number *';
            fIban.placeholder = 'e.g. 740123456';
            document.getElementById('l-bankcode').textContent = 'Bank code *';
            document.getElementById('f-bankcode').placeholder = 'e.g. 004 (HSBC)';
        } else if (mode === 'mx') {
            lIban.textContent = 'CLABE *';
            fIban.placeholder = '18 digits';
        } else if (mode === 'am') {
            // USD-via-SWIFT corridor: IBAN or account number + mandatory SWIFT/BIC.
            lIban.textContent = 'IBAN or account number *';
            fIban.placeholder = 'AM.. IBAN or your account number';
            lBic.textContent = 'SWIFT/BIC code *';
            fBic.placeholder = 'e.g. ARMIAM22';
        } else if (mode === 'np' || mode === 'et') {
            // USD-via-SWIFT corridor: account number + mandatory SWIFT/BIC.
            lIban.textContent = 'Account number *';
            fIban.placeholder = 'as shown in your banking app';
            lBic.textContent = 'SWIFT/BIC code *';
            fBic.placeholder = mode === 'et' ? 'e.g. CBETETAA' : 'e.g. NARBNPKA';
        } else if (mode === 'iban') {
            lIban.textContent = 'IBAN *';
            fIban.placeholder = 'DE89 3704 0044 0532 0130 00';
            lBic.textContent = 'BIC/SWIFT (optional)';
            fBic.placeholder = 'COBADEFFXXX';
        } else {
            lIban.textContent = 'IBAN or account number *';
            fIban.placeholder = 'DE89 3704 0044 0532 0130 00';
            lBic.textContent = 'BIC/SWIFT';
            fBic.placeholder = 'COBADEFFXXX';
        }
    }

    // Build the payout_details payload: sanitized (no spaces/dashes, uppercased
    // where applicable) and containing ONLY the fields relevant to the selected
    // country, so hidden-field leftovers never reach the backend.
    function buildPayoutDetails(get) {
        const clean = id => get(id).trim().replace(/[\s-]+/g, '');
        const country = get('f-country');
        const mode = bankMode(country);
        const pd = {
            holder: get('f-holder').trim(),
            iban: clean('f-iban').toUpperCase(),
            bank: get('f-bank').trim(),
        };
        if (mode === 'us') {
            pd.routing_number = clean('f-routing');
            pd.account_type = get('f-account-type');
        } else if (mode === 'ca') {
            pd.institution_number = clean('f-institution');
            pd.transit_number = clean('f-transit');
        } else if (mode === 'au') {
            pd.bsb_code = clean('f-bsb');
        } else if (mode === 'jp') {
            pd.bank_code = clean('f-bankcode');
            pd.branch_code = clean('f-branchcode');
            pd.account_type = get('f-account-type');
        } else if (mode === 'sg' || mode === 'hk') {
            pd.bank_code = clean('f-bankcode');
        } else {
            // IBAN countries + India (IFSC lives in the BIC field)
            pd.bic = clean('f-bic').toUpperCase();
        }
        if (mode === 'am' || mode === 'np' || mode === 'et') {
            /* Qonto's SWIFT rail requires all four, so a missing one fails the
               payout at approve time with an unhelpful error rather than here. */
            pd.addr_first_line = get('f-benaddr-line').trim();
            pd.addr_city = get('f-benaddr-city').trim();
            pd.addr_post_code = get('f-benaddr-post').trim();
            pd.addr_country_iso = COUNTRY_ISO[country] || '';
        }
        return pd;
    }

    // The bank part of onboard.html's validateStep(0): holder, account fields
    // for the selected country, bank name. Returns [{ id, msg }], empty if ok.
    function validateBank(get) {
        const errors = [];
        const markBank = (id, msg) => { errors.push({ id: id, msg: msg }); };

        // Account holder: required, at least 2 words
        const holder = get('f-holder').trim();
        if (!(holder && holder.includes(' ') && holder.length >= 3)) {
            markBank('f-holder', 'Please enter the account holder name as shown on your bank account.');
        }

        // Bank details: country-aware validation
        const mode = bankMode(get('f-country'));
        const ibanVal = get('f-iban').trim().replace(/\s+/g, '');
        const bicVal = get('f-bic').trim().replace(/\s+/g, '').toUpperCase();
        const fieldVal = id => get(id).trim().replace(/\s+/g, '');

        if (mode === 'us') {
            if (!/^[0-9]{4,17}$/.test(ibanVal)) markBank('f-iban', 'US account numbers are 4-17 digits.');
            const routing = fieldVal('f-routing');
            let abaOk = /^[0-9]{9}$/.test(routing);
            if (abaOk) {
                const d = routing.split('').map(Number);
                abaOk = (3*(d[0]+d[3]+d[6]) + 7*(d[1]+d[4]+d[7]) + (d[2]+d[5]+d[8])) % 10 === 0;
            }
            if (!abaOk) markBank('f-routing', 'Routing number must be a valid 9-digit ACH routing number (check your banking app).');
            if (!get('f-account-type')) markBank('f-account-type', 'Please select checking or savings.');
        } else if (mode === 'in') {
            if (!/^[0-9]{6,20}$/.test(ibanVal)) markBank('f-iban', 'Indian account numbers are 6-20 digits.');
            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bicVal)) markBank('f-bic', 'IFSC code must be 11 characters (e.g. HDFC0001234).');
        } else if (mode === 'ca') {
            if (!/^[0-9]{3}$/.test(fieldVal('f-institution'))) markBank('f-institution', 'Institution number must be 3 digits.');
            if (!/^[0-9]{5}$/.test(fieldVal('f-transit'))) markBank('f-transit', 'Transit number must be 5 digits.');
            if (!/^[0-9]{5,12}$/.test(ibanVal)) markBank('f-iban', 'Canadian account numbers are 5-12 digits.');
        } else if (mode === 'au') {
            if (!/^[0-9]{6}$/.test(fieldVal('f-bsb').replace(/-/g, ''))) markBank('f-bsb', 'BSB code must be 6 digits.');
            if (!/^[0-9]{4,10}$/.test(ibanVal)) markBank('f-iban', 'Australian account numbers are 4-10 digits.');
        } else if (mode === 'jp') {
            if (!/^[0-9]{4}$/.test(fieldVal('f-bankcode'))) markBank('f-bankcode', 'Japanese bank code must be 4 digits.');
            if (!/^[0-9]{3}$/.test(fieldVal('f-branchcode'))) markBank('f-branchcode', 'Branch code must be 3 digits.');
            if (!/^[0-9]{6,8}$/.test(ibanVal)) markBank('f-iban', 'Japanese account numbers are 6-8 digits.');
            if (!get('f-account-type')) markBank('f-account-type', 'Please select the account type.');
        } else if (mode === 'sg' || mode === 'hk') {
            if (!/^[0-9]{3,7}$/.test(fieldVal('f-bankcode'))) markBank('f-bankcode', 'Bank code must be 3-7 digits.');
            if (!/^[0-9]{5,15}$/.test(ibanVal)) markBank('f-iban', 'Account number should be 5-15 digits.');
        } else if (mode === 'mx') {
            let clabeOk = /^[0-9]{18}$/.test(ibanVal);
            if (clabeOk) {
                const w = [3,7,1];
                let sum = 0;
                for (let i = 0; i < 17; i++) sum += (parseInt(ibanVal[i]) * w[i % 3]) % 10;
                clabeOk = (10 - (sum % 10)) % 10 === parseInt(ibanVal[17]);
            }
            if (!clabeOk) markBank('f-iban', 'CLABE must be a valid 18-digit number (check with your bank).');
        } else if (mode === 'am') {
            if (!/^[A-Za-z0-9]{4,34}$/.test(ibanVal)) markBank('f-iban', 'Please enter your IBAN or bank account number.');
            else if (ibanVal.indexOf('AM') === 0 && !validateIBAN(ibanVal)) markBank('f-iban', 'That IBAN does not look valid; please double-check it.');
            if (!/^[A-Z0-9]{8}([A-Z0-9]{3})?$/.test(bicVal)) markBank('f-bic', 'SWIFT/BIC code is required for transfers to Armenia (8 or 11 characters, ask your bank).');
        } else if (mode === 'np' || mode === 'et') {
            const where = mode === 'et' ? 'Ethiopia' : 'Nepal';
            if (!/^[A-Za-z0-9]{4,34}$/.test(ibanVal)) markBank('f-iban', 'Please enter your bank account number.');
            if (!/^[A-Z0-9]{8}([A-Z0-9]{3})?$/.test(bicVal)) markBank('f-bic', 'SWIFT/BIC code is required for transfers to ' + where + ' (8 or 11 characters, ask your bank).');
        } else if (mode === 'iban') {
            if (!validateIBAN(ibanVal)) markBank('f-iban', 'Please enter a valid IBAN (your country uses IBAN for bank transfers).');
            if (bicVal && !/^[A-Z0-9]{8}([A-Z0-9]{3})?$/.test(bicVal)) markBank('f-bic', 'BIC/SWIFT must be 8 or 11 characters.');
        } else {
            if (ibanVal.length < 8) markBank('f-iban', 'Please enter your IBAN or account number.');
        }

        if (mode === 'am' || mode === 'np' || mode === 'et') {
            if (fieldVal('f-benaddr-line').length < 3) markBank('f-benaddr-line', 'Your street address is required for an international transfer.');
            if (fieldVal('f-benaddr-city').length < 2) markBank('f-benaddr-city', 'Your city is required for an international transfer.');
            if (fieldVal('f-benaddr-post').length < 3) markBank('f-benaddr-post', 'Your postal code is required for an international transfer.');
        }

        // Bank name: required
        const bank = get('f-bank').trim();
        if (!(bank && bank.length >= 3)) markBank('f-bank', 'Please enter your bank name and country.');

        return errors;
    }

    // Every input/select this module reads, for clearing error marks.
    const FIELD_IDS = ['f-holder','f-iban','f-bic','f-routing','f-account-type','f-institution','f-transit',
        'f-bsb','f-bankcode','f-branchcode','f-bank','f-benaddr-line','f-benaddr-city','f-benaddr-post'];

    window.pdoomBankFields = {
        validateIBAN: validateIBAN,
        COUNTRY_ISO: COUNTRY_ISO,
        bankMode: bankMode,
        updateBankFields: updateBankFields,
        buildPayoutDetails: buildPayoutDetails,
        validateBank: validateBank,
        FIELD_IDS: FIELD_IDS,
    };
})();
