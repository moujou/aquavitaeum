import { describe, it, expect } from 'vitest';
import {
  TRANSLATIONS,
  t,
  translateColour,
  translateGlance,
  translateRadarDimension,
  translateCharacteristic,
  translateFinishCharacter,
} from '../translations';

describe('i18n Translation Dictionary', () => {
  it('contains complete key parity between EN and DE dictionaries', () => {
    const enKeys = Object.keys(TRANSLATIONS.EN).sort();
    const deKeys = Object.keys(TRANSLATIONS.DE).sort();
    expect(enKeys).toEqual(deKeys);
  });

  it('translates UI keys correctly for EN and DE', () => {
    expect(t('appSubtitle', 'EN')).toBe('Fine Spirits Journal');
    expect(t('appSubtitle', 'DE')).toBe('Edelspirituosen Journal');
    expect(t('collection', 'DE')).toBe('Sammlung');
  });

  it('translates activeFlavors section title to Flavor Profile / Aroma-Profil', () => {
    expect(t('activeFlavors', 'EN')).toBe('Flavor Profile');
    expect(t('activeFlavors', 'DE')).toBe('Aroma-Profil');
  });

  it('translates tasting additions keys correctly', () => {
    expect(t('tastingAdditions', 'EN')).toBe('Tasting Additions');
    expect(t('tastingAdditions', 'DE')).toBe('Tasting-Zusätze');
    expect(t('withChocolateBtn', 'DE')).toBe('Mit Schokolade');
  });

  it('translates flavor category headers accurately', () => {
    expect(t('cat_peat_smoke', 'EN')).toBe('Peat & Smoke');
    expect(t('cat_peat_smoke', 'DE')).toBe('Torf & Rauch');
    expect(t('cat_cask_wood', 'DE')).toBe('Fass & Holz');
  });

  it('translates spirit colours accurately', () => {
    expect(translateColour('Gin Clear', 'EN')).toBe('Gin Clear');
    expect(translateColour('Gin Clear', 'DE')).toBe('Wasserhell / Klar');
    expect(translateColour('Amber', 'DE')).toBe('Bernstein');
    expect(translateColour('Tawny Port', 'EN')).toBe('Tawny Port');
    expect(translateColour('Chestnut', 'DE')).toBe('Kastanie / Oloroso');
    expect(translateColour('Treacle', 'DE')).toBe('Melasse / Schwarzeiche');
  });

  it('translates glance mouthfeel accurately', () => {
    expect(translateGlance('Oily', 'DE')).toBe('Ölig');
    expect(translateGlance('Creamy', 'DE')).toBe('Cremig');
    expect(translateGlance('Watery', 'DE')).toBe('Wässrig');
  });

  it('translates finish time intensity diagram keys accurately', () => {
    expect(t('finishTimeIntensityDiagram', 'EN')).toBe('Finish');
    expect(t('finishTimeIntensityDiagram', 'DE')).toBe('Abgang');
    expect(t('finishLength', 'DE')).toBe('Abgangslänge');
    expect(t('finishCharacterLabel', 'DE')).toBe('Abgangs-Charakter & Wärme');
  });

  it('translates finish characters accurately', () => {
    expect(translateFinishCharacter('Warming', 'EN')).toBe('Warming');
    expect(translateFinishCharacter('Warming', 'DE')).toBe('Wärmend');
    expect(translateFinishCharacter('Sharp', 'DE')).toBe('Scharf');
    expect(translateFinishCharacter('Spicy', 'DE')).toBe('Würzig');
    expect(translateFinishCharacter('Alcoholic', 'DE')).toBe('Alkoholisch');
    expect(translateFinishCharacter('Peated', 'DE')).toBe('Torfig');
    expect(translateFinishCharacter('Smoky', 'DE')).toBe('Rauchig');
    expect(translateFinishCharacter('Oaky', 'DE')).toBe('Eichenholz');
    expect(translateFinishCharacter('Tannic', 'DE')).toBe('Tanninreich');
    expect(translateFinishCharacter('Dry', 'DE')).toBe('Trocken');
    expect(translateFinishCharacter('Sweet', 'DE')).toBe('Süß');
    expect(translateFinishCharacter('Mild', 'DE')).toBe('Mild');
    expect(translateFinishCharacter('Saline', 'DE')).toBe('Salzig');
    expect(translateFinishCharacter('Mineral', 'DE')).toBe('Mineralisch');
  });

  it('translates characteristics accurately', () => {
    expect(translateCharacteristic('Cask Strength', 'EN')).toBe('Cask Strength');
    expect(translateCharacteristic('Cask Strength', 'DE')).toBe('Fassstärke');
    expect(translateCharacteristic('Heavily Peated', 'DE')).toBe('Stark getorft');
    expect(translateCharacteristic('Single Cask', 'DE')).toBe('Einzelfass');
    expect(translateCharacteristic('Triple Distilled', 'DE')).toBe('3-fach destilliert');
  });

  it('translates custom flavor keys accurately', () => {
    expect(t('createCustomFlavor', 'EN')).toBe('Custom Flavor');
    expect(t('createCustomFlavor', 'DE')).toBe('Eigenes Aroma');
    expect(t('customFlavorsCategory', 'DE')).toBe('Eigene Aromen');
    expect(t('defaultCategoryColor', 'DE')).toBe('Kategorie-Farbe');
    expect(t('customColor', 'DE')).toBe('Eigene Farbe');
    expect(t('sensoryDrawerTitle', 'DE')).toBe('Aromen-Kompass');
    expect(t('openSensoryDrawer', 'DE')).toBe('Aromen-Kompass');
  });

  it('translates radar dimensions accurately', () => {
    expect(translateRadarDimension('Peaty', 'DE')).toBe('Torfbetont');
    expect(translateRadarDimension('Woody', 'DE')).toBe('Holzig');
    expect(translateRadarDimension('Fruity', 'DE')).toBe('Fruchtig');
  });
});
