# Attribution

## System Reference Document 5.1

This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.

SRD 5.1 is also available under the Open Game License 1.0a. This project uses
the Creative Commons licence above instead.

## SRD data files

The JSON files in `srd-json-files/` come from
[5e-database](https://github.com/5e-bits/5e-database) by 5e-bits, which
structures the 2014 SRD 5.1 content as JSON. They are used under 5e-database's
MIT License, whose copyright and permission notice is in
`srd-json-files/LICENSE.md`.

The files carry two corrections against the SRD 5.1 text, both made on
13 September 2026:

- `5e-SRD-Levels.json`: the warlock's `invocations_known` at level 6 is 3,
  not 4. The SRD table gives 3 at levels 5 and 6 and 4 at levels 7 and 8.
- `5e-SRD-Proficiencies.json`: the disguise kit's `type` is `Other`, not
  `Artisan's Tools`. The SRD lists it on its own, outside the artisan's tools.

Everything else is unmodified. The app's importer reshapes the files into its
own tables, as described in `docs/data-model.md`.

## Space Grotesk

The app's typeface is [Space Grotesk](https://github.com/floriankarsten/space-grotesk)
by the Space Grotesk Project Authors, bundled through `@expo-google-fonts/space-grotesk`.
It is licensed under the SIL Open Font License 1.1, whose text ships with the package in
`LICENSE_FONT`.
