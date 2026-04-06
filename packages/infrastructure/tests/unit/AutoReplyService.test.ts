import { describe, it, expect } from 'vitest';
import { keywordMatchEnum } from '../../src/db/schema';
import { AutoReplyService } from '../../src/services/AutoReplyService';

describe('AutoReplyService Logic', () => {
  it('should instantiate correctly', () => {
    const service = new AutoReplyService();
    expect(service).toBeDefined();
  });
});
