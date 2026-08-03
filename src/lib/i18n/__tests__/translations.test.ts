import { describe, it, expect } from 'vitest';
import {
  TRANSLATIONS,
  t,
  translateColour,
  translateGlance,
  translateFinish,
  translateRadarDimension,
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
    expect(translateColour('Gold', 'EN')).toBe('Gold');
    expect(translateColour('Gold', 'DE')).toBe('Gold');
    expect(translateColour('Dark Oak', 'DE')).toBe('Dunkle Eiche');
    expect(translateColour('Amber', 'DE')).toBe('Bernstein');
  });

  it('translates glance mouthfeel accurately', () => {
    expect(translateGlance('Oily', 'DE')).toBe('Ölig');
    expect(translateGlance('Creamy', 'DE')).toBe('Cremig');
    expect(translateGlance('Watery', 'DE')).toBe('Wässrig');
  });

  it('translates finish durations accurately', () => {
    expect(translateFinish('Short', 'DE')).toBe('Kurz');
    expect(translateFinish('Long', 'DE')).toBe('Lang');
  });

  it('translates radar dimensions accurately', () => {
    expect(translateRadarDimension('Peaty', 'DE')).toBe('Torfbetont');
    expect(translateRadarDimension('Woody', 'DE')).toBe('Holzig');
    expect(translateRadarDimension('Fruity', 'DE')).toBe('Fruchtig');
  });
});
