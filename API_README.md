# OpenStax Math Textbooks API

This API provides access to openly licensed OpenStax mathematics textbooks for high school courses.

## Endpoints

All endpoints return JSON with the following structure:

```json
{
  "courseName": "Course Name",
  "openstaxBookTitle": "Book Title",
  "pdfUrl": "https://...",
  "license": "CC BY",
  "source": "OpenStax"
}
```

### Available Endpoints

- `GET /api/math/algebra1` - Elementary Algebra 2e
- `GET /api/math/algebra2` - Intermediate Algebra 2e
- `GET /api/math/precalculus` - Precalculus 2e
- `GET /api/math/calculus-ab` - Calculus Volume 1
- `GET /api/math/calculus-bc` - Calculus Volume 2

## OpenStax Licensing

All textbooks are provided by [OpenStax](https://openstax.org/) under the Creative Commons Attribution License (CC BY 4.0). This means:

- **Free to use** - No cost for students or educators
- **Free to modify** - Can be adapted for your needs
- **Free to share** - Can be distributed to anyone

### Attribution Required

When using these materials, you must provide attribution to OpenStax. Example:

> "This textbook is based on [Book Title] by OpenStax, licensed under CC BY 4.0."

## Legal Compliance

- We do **NOT** scrape or rehost copyrighted content
- We provide direct links to official OpenStax PDF URLs
- All content is openly licensed by OpenStax
- PDF files are hosted on OpenStax's official servers

## Learn More

Visit [OpenStax.org](https://openstax.org/) to learn more about their mission to improve educational access through high-quality, peer-reviewed, openly licensed textbooks.
