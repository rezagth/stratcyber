// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { isForbiddenAddress, resolvePublicAddresses } from '@/lib/scan/net-guard';

describe('isForbiddenAddress', () => {
  it.each([
    '0.0.0.0', '10.1.2.3', '100.64.0.1', '127.0.0.1', '127.255.255.254', '169.254.169.254', '172.16.0.1', '172.31.255.255',
    '192.168.1.10', '192.0.2.5', '198.18.0.1', '203.0.113.9', '224.0.0.1', '255.255.255.255',
    '::', '::1', 'fc00::1', 'fd12:3456::1', 'fe80::1', 'ff02::1', '2001:db8::1', '2002:7f00:1::', '64:ff9b::7f00:1',
    '::ffff:127.0.0.1', '::ffff:10.0.0.1', '::ffff:7f00:1', '::127.0.0.1', 'fe80::1%eth0',
  ])('refuse %s', (address) => {
    expect(isForbiddenAddress(address)).toBe(true);
  });

  it.each(['93.184.216.34', '8.8.8.8', '172.32.0.1', '172.15.255.255', '100.63.255.255', '2606:4700:4700::1111', '2a00:1450:4007:80f::200e', '::ffff:8.8.8.8'])(
    'accepte l\'adresse publique %s',
    (address) => {
      expect(isForbiddenAddress(address)).toBe(false);
    }
  );

  it('refuse tout ce qui n\'est pas une adresse IP valide', () => {
    for (const bad of ['', 'exemple.fr', '999.1.1.1', '1.2.3', '1.2.3.4.5', '::g', ':::1', '1:2:3:4:5:6:7:8:9']) {
      expect(isForbiddenAddress(bad)).toBe(true);
    }
  });
});

describe('resolvePublicAddresses', () => {
  it('renvoie les adresses publiques, IPv4 d\'abord', async () => {
    const result = await resolvePublicAddresses('exemple.fr', async () => [
      { address: '2606:4700:4700::1111', family: 6 },
      { address: '93.184.216.34', family: 4 },
    ]);
    expect(result).toEqual({ addresses: [{ address: '93.184.216.34', family: 4 }, { address: '2606:4700:4700::1111', family: 6 }] });
  });

  it('refuse dès qu\'UNE adresse est interne (DNS rebinding / enregistrement piégé)', async () => {
    const result = await resolvePublicAddresses('piege.fr', async () => [
      { address: '93.184.216.34', family: 4 },
      { address: '169.254.169.254', family: 4 },
    ]);
    expect('error' in result && result.error).toMatch(/non publique/);
  });

  it('refuse un nom qui pointe vers localhost', async () => {
    const result = await resolvePublicAddresses('interne.fr', async () => [{ address: '127.0.0.1', family: 4 }]);
    expect('error' in result).toBe(true);
  });

  it('renvoie une erreur claire si le nom ne se résout pas ou ne donne rien', async () => {
    expect('error' in (await resolvePublicAddresses('absent.fr', async () => { throw new Error('ENOTFOUND'); }))).toBe(true);
    expect('error' in (await resolvePublicAddresses('vide.fr', async () => []))).toBe(true);
  });
});
