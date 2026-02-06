import { generateSlug, isValidSlug, RESERVED_SLUGS, SlugTakenError, slugSchema } from './slug'

describe('generateSlug', () => {
  describe('German umlauts', () => {
    it('converts ä to ae', () => {
      expect(generateSlug('Käse')).toBe('kaese')
      expect(generateSlug('Händel')).toBe('haendel')
    })

    it('converts ö to oe', () => {
      expect(generateSlug('Köln')).toBe('koeln')
      expect(generateSlug('Gödel')).toBe('goedel')
    })

    it('converts ü to ue', () => {
      expect(generateSlug('Zürich')).toBe('zuerich')
      expect(generateSlug('Führung')).toBe('fuehrung')
    })

    it('converts ß to ss', () => {
      expect(generateSlug('Große')).toBe('grosse')
      expect(generateSlug('Straße')).toBe('strasse')
    })

    it('handles uppercase German characters', () => {
      expect(generateSlug('ÜBUNG')).toBe('uebung')
      expect(generateSlug('ÖFFENTLICH')).toBe('oeffentlich')
      expect(generateSlug('ÄNDERUNG')).toBe('aenderung')
    })

    it('handles capital eszett (ẞ)', () => {
      expect(generateSlug('GROẞE')).toBe('grosse')
    })

    it('handles combined German examples', () => {
      expect(generateSlug('Kunsthaus Zürich')).toBe('kunsthaus-zuerich')
      expect(generateSlug('Highlights-Führung')).toBe('highlights-fuehrung')
      expect(generateSlug('Große Ausstellung')).toBe('grosse-ausstellung')
    })
  })

  describe('French and other accents', () => {
    it('removes French accents', () => {
      expect(generateSlug('Musée')).toBe('musee')
      expect(generateSlug('Château')).toBe('chateau')
      expect(generateSlug('café')).toBe('cafe')
      expect(generateSlug('résumé')).toBe('resume')
    })

    it("handles French elision (d' and L')", () => {
      expect(generateSlug("Musée d'Orsay")).toBe('musee-d-orsay')
      expect(generateSlug("L'art moderne")).toBe('l-art-moderne')
    })

    it('handles naïve (with diaeresis)', () => {
      expect(generateSlug('naïve')).toBe('naive')
    })

    it('handles combined French examples', () => {
      expect(generateSlug('Château de Versailles')).toBe('chateau-de-versailles')
      expect(generateSlug('naïve café résumé')).toBe('naive-cafe-resume')
    })
  })

  describe('Swiss and regional names', () => {
    it('handles La Chaux-de-Fonds correctly', () => {
      expect(generateSlug('La Chaux-de-Fonds')).toBe('la-chaux-de-fonds')
    })

    it('handles Graubünden', () => {
      expect(generateSlug('Graubünden')).toBe('graubuenden')
    })
  })

  describe('Unicode dashes', () => {
    it('normalizes en-dash (–) to hyphen', () => {
      expect(generateSlug('En–dash test')).toBe('en-dash-test')
    })

    it('normalizes em-dash (—) to hyphen', () => {
      expect(generateSlug('Em—dash test')).toBe('em-dash-test')
    })

    it('handles mixed dashes', () => {
      expect(generateSlug('En–dash and em—dash')).toBe('en-dash-and-em-dash')
    })
  })

  describe('contractions', () => {
    it("handles don't → dont", () => {
      expect(generateSlug("don't miss")).toBe('dont-miss')
    })

    it("handles it's → its", () => {
      expect(generateSlug("it's great")).toBe('its-great')
    })

    it('handles curly apostrophe', () => {
      expect(generateSlug('don\u2019t miss')).toBe('dont-miss')
    })
  })

  describe('spacing and special characters', () => {
    it('converts spaces to hyphens', () => {
      expect(generateSlug('hello world')).toBe('hello-world')
    })

    it('removes special characters', () => {
      expect(generateSlug('hello!world?')).toBe('hello-world')
    })

    it('collapses multiple spaces/special chars to single hyphen', () => {
      expect(generateSlug('hello   world')).toBe('hello-world')
      expect(generateSlug('hello!!!world')).toBe('hello-world')
    })

    it('removes leading/trailing hyphens', () => {
      expect(generateSlug('  hello  ')).toBe('hello')
      expect(generateSlug('---hello---')).toBe('hello')
    })

    it('handles numbers', () => {
      expect(generateSlug('Tour 2024')).toBe('tour-2024')
      expect(generateSlug('123 Test')).toBe('123-test')
    })
  })

  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(generateSlug('')).toBe('')
    })

    it('handles string with only special characters', () => {
      expect(generateSlug('!!!')).toBe('')
    })

    it('handles very long input', () => {
      const longInput = 'A'.repeat(200)
      expect(generateSlug(longInput).length).toBeLessThanOrEqual(200)
    })

    it('handles already-valid slug', () => {
      expect(generateSlug('already-valid')).toBe('already-valid')
    })

    it('handles single character', () => {
      expect(generateSlug('A')).toBe('a')
    })
  })

  describe('real-world museum examples', () => {
    it('handles Kunsthaus Zürich', () => {
      expect(generateSlug('Kunsthaus Zürich')).toBe('kunsthaus-zuerich')
    })

    it('handles Giacometti Exhibition', () => {
      expect(generateSlug('Giacometti Exhibition')).toBe('giacometti-exhibition')
    })

    it('handles Tour highlights - Main Building', () => {
      expect(generateSlug('Tour highlights - Main Building')).toBe('tour-highlights-main-building')
    })
  })
})

describe('slugSchema', () => {
  describe('valid slugs', () => {
    it.each([
      'hello',
      'hello-world',
      'my-awesome-tour',
      'kunsthaus-zuerich',
      'tour-2024',
      '123-test',
      'a1b2c3',
    ])('accepts valid slug: %s', (slug) => {
      expect(slugSchema.safeParse(slug).success).toBe(true)
    })
  })

  describe('invalid slugs', () => {
    it('rejects slugs shorter than 3 characters', () => {
      const result = slugSchema.safeParse('ab')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 3')
      }
    })

    it('rejects slugs longer than 100 characters', () => {
      const result = slugSchema.safeParse('a'.repeat(101))
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at most 100')
      }
    })

    it('rejects uppercase letters', () => {
      const result = slugSchema.safeParse('Hello')
      expect(result.success).toBe(false)
    })

    it('rejects leading hyphens', () => {
      const result = slugSchema.safeParse('-hello')
      expect(result.success).toBe(false)
    })

    it('rejects trailing hyphens', () => {
      const result = slugSchema.safeParse('hello-')
      expect(result.success).toBe(false)
    })

    it('rejects consecutive hyphens', () => {
      const result = slugSchema.safeParse('hello--world')
      expect(result.success).toBe(false)
    })

    it('rejects spaces', () => {
      const result = slugSchema.safeParse('hello world')
      expect(result.success).toBe(false)
    })

    it('rejects special characters', () => {
      expect(slugSchema.safeParse('hello!world').success).toBe(false)
      expect(slugSchema.safeParse('hello@world').success).toBe(false)
      expect(slugSchema.safeParse('hello_world').success).toBe(false)
    })
  })

  describe('reserved slugs', () => {
    it.each(RESERVED_SLUGS)('rejects reserved slug: %s', (slug) => {
      const result = slugSchema.safeParse(slug)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('reserved')
      }
    })
  })
})

describe('isValidSlug', () => {
  it('returns true for valid slugs', () => {
    expect(isValidSlug('hello-world')).toBe(true)
    expect(isValidSlug('kunsthaus-zuerich')).toBe(true)
  })

  it('returns false for invalid slugs', () => {
    expect(isValidSlug('ab')).toBe(false)
    expect(isValidSlug('Hello')).toBe(false)
    expect(isValidSlug('admin')).toBe(false)
  })
})

describe('SlugTakenError', () => {
  it('creates error for organization scope', () => {
    const error = new SlugTakenError('my-slug', 'organization')
    expect(error.message).toBe('This slug is already taken by another organization')
    expect(error.slug).toBe('my-slug')
    expect(error.scope).toBe('organization')
    expect(error.name).toBe('SlugTakenError')
  })

  it('creates error for tour scope', () => {
    const error = new SlugTakenError('my-slug', 'tour')
    expect(error.message).toBe('You already used this slug for another tour')
    expect(error.slug).toBe('my-slug')
    expect(error.scope).toBe('tour')
  })
})
