import { useMemo } from 'react';
import { DetectionInference, ArticleMetadata } from '../../module_bindings/types';

export function useDerivedStats(
  inferences: readonly DetectionInference[],
  articles: readonly ArticleMetadata[]
) {
  return useMemo(() => {
    const processed  = inferences.filter(r => r.isProcessed);
    const fake       = inferences.filter(r => r.classification === 'Fake');
    const real       = inferences.filter(r => r.classification === 'Real');
    const unverified = inferences.filter(r => r.classification === 'Unverified');
    const pending    = inferences.filter(r => !r.isProcessed);

    const totalProcessed    = processed.length;
    const fakeRate          = totalProcessed > 0 ? (fake.length / totalProcessed) * 100 : 0;
    const avgConfidence     = processed.length > 0
      ? processed.reduce((s, r) => s + r.confidenceScore, 0) / processed.length
      : 0;
    const uniqueDomains     = new Set(articles.map(a => a.domain)).size;

    return { fake, real, unverified, pending, processed, fakeRate, avgConfidence, uniqueDomains };
  }, [inferences, articles]);
}
