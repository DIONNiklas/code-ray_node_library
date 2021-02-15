provider "aws" {
  access_key = "ASIARLB6WIOUGID6S2HJ"
  secret_key = "dNkyRwpqiEyW91e4uKwCRWHCns+APvGaRZTiVDIX"
  token = "IQoJb3JpZ2luX2VjECsaDGV1LWNlbnRyYWwtMSJHMEUCID8EEkMHuWKCKWE84UKLcKneZJRwDQegKjM9CilBQjzLAiEAypKYh4y3MbwU0PGWs2CBSYs+puz4KgtNG2yuPCtNunsqpgMINBAAGgwwOTI0NzMyNzk0MDAiDPrcmOIHhl1DwOqTLiqDA0qdBBeCMuMo3WvAF/9T2Xapt5L5v+aHYC+2uqc1BU9vhlYuaDcLPYH7uFEgStxzyQcCsNc2lMM+CaYA+2kcq+/g2gwktnU66YD7cbFiz+Rz/dbd9uaBWismH/RFMZEFViR0nII0WslQo9OL9tcZnnaJzkYDrEKZ5WedSm6vzS5cbpCwu3QDYQ2ZIAvmPBawEHWTnkjzV0AIkAD3/4pG/JJ00CdNyb8bYDwkvIwCdMGidUI4o+RAFiGq9o4ptyKAAVuKpY+c9HwMXMpOw4pxtaO7EHeyFmGevFcInlao149BYjI+CgzZ6yQzItRg2drP8yAv6+hzL3GFkB6iOcxwqdJEY/4dEYsnw17q9IpKWPioMkbdLpz+AFpSNzKh280BHJsAmN6zWawRSezEAvXzaD3S/ZKZe3jJtu/i03v2iiUrNf3WAuqMOqrxaSwRQZDzko+icnU2ijA9uZ5PaBvrO/VITAElc3Q+6XR72+hIXYXWIpO05dn5tOl2VQ46ByOgGzxp6jCskKuBBjqmAfc78UT/8xIbAc2+Crc/SEeZva2Xswy3Q9JZCr48xXTx6zF/lP9Qr67p5jK0XEYXYeMjmU2TZ2CxcQTbDE0kBj4souXcFNdKz2okEprsm78r8DXCzRH88o4s3FseDIRCcNsJ+iN+4YYvWuzqw0WC3tq7is2IqSPbalA745pvio6tYih2nxaQ3OEvZZc/1//43eRR7W+7aXW7VPmipHXtUER+U0yvOp4="
  region = "eu-central-1"
}

module "cesar-lambda" {
  providers = {
    aws = aws
  }
  source  = "app.terraform.io/DI-ON-solutions/cesar-lambda/aws"
  version = "1.1.12"
  functionTimeout = 120


  functionName = "Helllooooo"
  path = "${path.module}/build"
  serviceName = "TEST"
}