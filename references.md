# References — Fake News Detection Engine (BDT Project)

20 academic references organized by relevance to the project.

---

## A. Confidence Scoring & Calibration

> [!NOTE]
> These 4 papers directly underpin the composite credibility scoring formula:
> $S = w_1 \cdot C_{llm} + w_2 \cdot C_{source} + w_3 \cdot C_{linguistic}$

**[1]** Ruchansky, N., Seo, S., & Liu, Y. (2017). CSI: A Hybrid Deep Model for Fake News Detection. *Proceedings of the 2017 ACM CIKM*, 797–806. https://doi.org/10.1145/3132847.3132877
— *Multi-signal composite scoring framework (Capture, Score, Integrate).*

**[2]** Popat, K., Mukherjee, S., Yates, A., & Weikum, G. (2018). DeClarE: Debunking Fake News and False Claims using Evidence-Aware Deep Learning. *Proceedings of EMNLP 2018*. https://aclanthology.org/D18-1003/
— *Source trustworthiness embeddings as a weighted credibility signal.*

**[3]** Horne, B. D. & Adali, S. (2017). This Just In: Fake News Packs a Lot in Title, Uses Simpler, Repetitive Content in Text Body, More Similar to Satire than Real News. *Proceedings of ICWSM*, 11(1), 759–766. https://arxiv.org/abs/1703.09398
— *Linguistic features of fake news headlines (sensationalism, complexity).*

**[4]** Guo, C., Pleiss, G., Sun, Y., & Weinberger, K. Q. (2017). On Calibration of Modern Neural Networks. *Proceedings of ICML 2017*. https://proceedings.mlr.press/v70/guo17a.html
— *Temperature scaling to correct overconfident model outputs.*

---

## B. Foundational Surveys & Empirical Studies

**[5]** Shu, K., Sliva, A., Wang, S., Tang, J., & Liu, H. (2017). Fake News Detection on Social Media: A Data Mining Perspective. *ACM SIGKDD Explorations Newsletter*, 19(1), 22–36. https://doi.org/10.1145/3137597.3137600
— *Seminal survey defining the fake news detection problem taxonomy.*

**[6]** Zhou, X. & Zafarani, R. (2020). A Survey of Fake News: Fundamental Theories, Detection Methods, and Opportunities. *ACM Computing Surveys*, 53(5), 1–40. https://doi.org/10.1145/3395046
— *Comprehensive survey of theories, methods, datasets, and future directions.*

**[7]** Allcott, H. & Gentzkow, M. (2017). Social Media and Fake News in the 2016 Election. *Journal of Economic Perspectives*, 31(2), 211–236. https://doi.org/10.1257/jep.31.2.211
— *Empirical analysis of fake news prevalence and its measurable impact.*

**[8]** Vosoughi, S., Roy, D., & Aral, S. (2018). The Spread of True and False News Online. *Science*, 359(6380), 1146–1151. https://doi.org/10.1126/science.aap9559
— *Large-scale empirical study: falsehoods spread faster and broader than truth.*

---

## C. Benchmark Datasets & Fact Verification

**[9]** Wang, W. Y. (2017). "Liar, Liar Pants on Fire": A New Benchmark Dataset for Fake News Detection. *Proceedings of ACL 2017 (Short Papers)*, 422–426. https://aclanthology.org/P17-2067/
— *LIAR benchmark with 12.8K labeled statements and fine-grained truthfulness scale.*

**[10]** Thorne, J., Vlachos, A., Christodoulopoulos, C., & Mittal, A. (2018). FEVER: A Large-scale Dataset for Fact Extraction and VERification. *Proceedings of NAACL-HLT 2018*, 809–819. https://doi.org/10.18653/v1/N18-1074
— *FEVER benchmark for evidence-based claim verification.*

**[11]** Pérez-Rosas, V., Kleinberg, B., Lefevre, A., & Mihalcea, R. (2018). Automatic Detection of Fake News. *Proceedings of COLING 2018*, 3391–3401. https://aclanthology.org/C18-1287/
— *Multi-domain fake news corpus with linguistic and semantic feature analysis.*

---

## D. NLP & Transformer Models

**[12]** Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). Attention Is All You Need. *Advances in Neural Information Processing Systems*, 30. https://papers.nips.cc/paper/7181-attention-is-all-you-need
— *Transformer architecture — foundation for all LLM-based classifiers used in this project.*

**[13]** Devlin, J., Chang, M.-W., Lee, K., & Toutanova, K. (2019). BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding. *Proceedings of NAACL-HLT 2019*, 4171–4186. https://aclanthology.org/N19-1423/
— *BERT pre-training paradigm used by downstream fake news classifiers.*

**[14]** Touvron, H., Lavril, T., Izacard, G., et al. (2023). LLaMA: Open and Efficient Foundation Language Models. *arXiv preprint arXiv:2302.13971*. https://arxiv.org/abs/2302.13971
— *LLaMA model family — our Groq inference uses Llama 4 Scout for classification.*

**[15]** Kaliyar, R., Goswami, A., & Narang, P. (2021). FakeBERT: Fake News Detection in Social Media with a BERT-based Deep Learning Approach. *Multimedia Tools and Applications*, 80, 11765–11788. https://doi.org/10.1007/s11042-020-10183-2
— *BERT + parallel CNN hybrid for ambiguous fake news detection.*

---

## E. Detection Architectures & Feature Engineering

**[16]** Rashkin, H., Choi, E., Jang, J. Y., Volkova, S., & Choi, Y. (2017). Truth of Varying Shades: Analyzing Language in Fake News and Political Fact-Checking. *Proceedings of EMNLP 2017*, 2931–2937. https://aclanthology.org/D17-1317/
— *Linguistic cue analysis: superlatives, modal adverbs, and dramatic language in propaganda/hoaxes.*

**[17]** Potthast, M., Kiesel, J., Reinartz, K., Bevendorff, J., & Stein, B. (2018). A Stylometric Inquiry into Hyperpartisan and Fake News. *Proceedings of ACL 2018*, 231–240. https://doi.org/10.18653/v1/P18-1022
— *Stylometry: writing style features distinguish hyperpartisan from credible news.*

**[18]** Przybyla, P. (2020). Capturing the Style of Fake News. *Proceedings of AAAI 2020*, 34(01), 490–497. https://doi.org/10.1609/aaai.v34i01.5386
— *Multi-head attention over stylistic features for fake news style detection.*

**[19]** Reis, J. C. S., Correia, A., Murai, F., Veloso, A., Benevenuto, F., & Cambria, E. (2019). Supervised Learning for Fake News Detection. *IEEE Intelligent Systems*, 34(2), 76–81. https://doi.org/10.1109/MIS.2019.2899143
— *Systematic comparison of features (linguistic, source-based, visual) for supervised detection.*

---

## F. Social Context & AI-Generated Threats

**[20]** Nguyen, V.-H., Sugiyama, K., Nakov, P., & Kan, M.-Y. (2020). FANG: Leveraging Social Context for Fake News Detection Using Graph Representation. *Proceedings of CIKM 2020*, 1165–1174. https://doi.org/10.1145/3340531.3412046
— *Graph neural network approach incorporating social propagation context.*

**[21]** Kreps, S., McCain, R. M., & Brundage, M. (2022). All the News That's Fit to Fabricate: AI-Generated Text as a Tool of Media Misinformation. *Journal of Experimental Political Science*, 9(1), 104–117. https://doi.org/10.1017/XPS.2020.37
— *Empirical study: humans cannot distinguish AI-generated from human-written news.*

Here are the links extracted from the provided references:

*   **[1]** [https://doi.org/10.1145/3132847.3132877](https://doi.org/10.1145/3132847.3132877)
*   **[2]** [https://aclanthology.org/D18-1003/](https://aclanthology.org/D18-1003/)
*   **[3]** [https://arxiv.org/abs/1703.09398](https://arxiv.org/abs/1703.09398)
*   **[4]** [https://proceedings.mlr.press/v70/guo17a.html](https://proceedings.mlr.press/v70/guo17a.html)
*   **[5]** [https://doi.org/10.1145/3137597.3137600](https://doi.org/10.1145/3137597.3137600)
*   **[6]** [https://doi.org/10.1145/3395046](https://doi.org/10.1145/3395046)
*   **[7]** [https://doi.org/10.1257/jep.31.2.211](https://doi.org/10.1257/jep.31.2.211)
*   **[8]** [https://doi.org/10.1126/science.aap9559](https://doi.org/10.1126/science.aap9559)
*   **[9]** [https://aclanthology.org/P17-2067/](https://aclanthology.org/P17-2067/)
*   **[10]** [https://doi.org/10.18653/v1/N18-1074](https://doi.org/10.18653/v1/N18-1074)
*   **[11]** [https://aclanthology.org/C18-1287/](https://aclanthology.org/C18-1287/)
*   **[12]** [https://papers.nips.cc/paper/7181-attention-is-all-you-need](https://papers.nips.cc/paper/7181-attention-is-all-you-need)
*   **[13]** [https://aclanthology.org/N19-1423/](https://aclanthology.org/N19-1423/)
*   **[14]** [https://arxiv.org/abs/2302.13971](https://arxiv.org/abs/2302.13971)
*   **[15]** [https://doi.org/10.1007/s11042-020-10183-2](https://doi.org/10.1007/s11042-020-10183-2)
*   **[16]** [https://aclanthology.org/D17-1317/](https://aclanthology.org/D17-1317/)
*   **[17]** [https://doi.org/10.18653/v1/P18-1022](https://doi.org/10.18653/v1/P18-1022)
*   **[18]** [https://doi.org/10.1609/aaai.v34i01.5386](https://doi.org/10.1609/aaai.v34i01.5386)
*   **[19]** [https://doi.org/10.1109/MIS.2019.2899143](https://doi.org/10.1109/MIS.2019.2899143)
*   **[20]** [https://doi.org/10.1145/3340531.3412046](https://doi.org/10.1145/3340531.3412046)
*   **[21]** [https://doi.org/10.1017/XPS.2020.37](https://doi.org/10.1017/XPS.2020.37)