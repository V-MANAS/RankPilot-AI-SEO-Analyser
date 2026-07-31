import mongoose from 'mongoose';

const siteMetricSchema = new mongoose.Schema({
    url: { type: String, required: true },
    hostname: { type: String },
    overallScore: { type: Number, default: 0 },
    categories: {
        seo: { type: Number, default: 0 },
        performance: { type: Number, default: 0 },
        accessibility: { type: Number, default: 0 },
        bestPractices: { type: Number, default: 0 },
    },
    loadTime: { type: Number, default: 0 },
    pageSize: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
    metaData: {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        canonical: { type: String, default: '' },
        robots: { type: String, default: '' },
        ogTitle: { type: String, default: '' },
        ogDescription: { type: String, default: '' },
        ogImage: { type: String, default: '' },
        viewport: { type: String, default: '' },
        charset: { type: String, default: '' },
    },
    headings: {
        h1: { type: Number, default: 0 },
        h2: { type: Number, default: 0 },
        h3: { type: Number, default: 0 },
        h4: { type: Number, default: 0 },
        h5: { type: Number, default: 0 },
        h6: { type: Number, default: 0 },
        h1Texts: [String],
    },
    links: {
        internal: { type: Number, default: 0 },
        external: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
    },
    images: {
        total: { type: Number, default: 0 },
        missingAlt: { type: Number, default: 0 },
        withAlt: { type: Number, default: 0 },
    },
    keywords: [
        {
            word: String,
            count: Number,
            density: Number,
        },
    ],
}, { _id: false });

const competitorComparisonSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    urlA: { type: String, required: true },
    urlB: { type: String, required: true },
    analysisA: siteMetricSchema,
    analysisB: siteMetricSchema,
    comparisonSummary: {
        overallWinner: { type: String, default: 'tie' },
        metricsWonA: { type: Number, default: 0 },
        metricsWonB: { type: Number, default: 0 },
        similarityPercentage: { type: Number, default: 80 },
        overallSummary: { type: String, default: '' },
        strongestAdvantage: { type: String, default: '' },
        biggestWeakness: { type: String, default: '' },
        recommendations: [String],
        estimatedSeoGain: { type: String, default: '+12 SEO Points' },
        siteABetterIn: [String],
        siteBBetterIn: [String],
        executiveSummary: { type: String, default: '' },
    },
}, { timestamps: true });

const CompetitorComparison = mongoose.model('CompetitorComparison', competitorComparisonSchema);

export default CompetitorComparison;
