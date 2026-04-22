import { normalizeArchiveBundleOutputPath } from '../../src/services/archive/archive-bundle.service.js';

describe('archive bundle helpers', () => {
  it('appends .tar.gz when the user omits an archive extension', () => {
    expect(normalizeArchiveBundleOutputPath('backup/output/atlas-lab-images')).toBe(
      'backup/output/atlas-lab-images.tar.gz'
    );
  });

  it('converts a raw .tar path into .tar.gz without duplicating .tar', () => {
    expect(normalizeArchiveBundleOutputPath('backup/output/atlas-lab-images.tar')).toBe(
      'backup/output/atlas-lab-images.tar.gz'
    );
  });

  it('preserves supported bundle extensions', () => {
    expect(normalizeArchiveBundleOutputPath('backup/output/atlas-lab-images.tar.gz')).toBe(
      'backup/output/atlas-lab-images.tar.gz'
    );
    expect(normalizeArchiveBundleOutputPath('backup/output/atlas-lab-images.tgz')).toBe(
      'backup/output/atlas-lab-images.tgz'
    );
  });
});
