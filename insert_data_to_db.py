from bs4 import BeautifulSoup
import json
import numpy as np
import pymongo
import requests

HM_URL = 'https://www2.hm.com'

ITEMS_URL = {
    'shorts': r'https://www2.hm.com/en_us/women/products/shorts.html?sort=stock&image-size=small&image=model&offset=0&page-size=72',
    'dresses': 'https://www2.hm.com/en_us/women/products/dresses.html?sort=stock&image-size=small&image=model&offset=0&page-size=72',
    "coats": r'https://www2.hm.com/en_us/women/products/jackets-coats/coats.html?sort=stock&image-size=small&image=model&offset=0&page-size=72',
    'hoodies': r'https://www2.hm.com/en_us/men/products/hoodies-sweatshirts.html?sort=stock&image-size=small&image=model&offset=0&page-size=72',
    'skirts': r'https://www2.hm.com/en_us/women/products/skirts.html?sort=stock&image-size=small&image=model&offset=0&page-size=108',
    'shirts': r'https://www2.hm.com/en_us/men/products/t-shirts-tank-tops.html?sort=stock&image-size=small&image=model&offset=0&page-size=108',
    'pants': r'https://www2.hm.com/en_us/women/products/pants.html?sort=stock&image-size=small&image=model&offset=0&page-size=72',
    'jackets': r'https://www2.hm.com/en_us/women/products/jackets-coats/jackets.html?sort=stock&image-size=small&image=model&offset=0&page-size=72'
}

agent = {
    "User-Agent": 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'}

Client = pymongo.MongoClient("mongodb+srv://user:1234@probaz.aicyx.mongodb.net/ProBaz?retryWrites=true&w=majority")
db = Client.ProBaz
items_collection = db.items

np.random.seed(1313)

COLORS = [
    '#FFFFFF',
    '#F44336',
    '#4CAF50',
    '#2196F3',
    '#FFC107',
    '#212121',
    '#795548',
    '#9E9E9E',
    '#FF4081',
    '#F8BBD0'
]

COLORS_NAMES_WITH_HEX = {
    'white': '#FFFFFF',
    'red': '#F44336',
    'green': '#4CAF50',
    'blue': '#2196F3',
    'yellow': '#FFC107',
    'black': '#212121',
    'brown': '#795548',
    'grey': '#9E9E9E',
    'rose': '#FF4081'
}

COLORS_NAMES = ['grey', 'green', 'red', 'blue', 'white', 'rose', 'black', 'yellow', 'brown']
SIZES = ['XS', 'S', 'M', 'L', 'XL']


def check_color(descriptive_color):
    """
    Function returns basic descriptive color based on color
    found in product description on H&M page.

    :param descriptive_color: color found on H&M page
    :return: basic color or None if basic color not found
    """

    for color in COLORS_NAMES:
        if color in descriptive_color:
            return color

    return None


def find_good_image(soup_page_content, color):
    """
    Function finds link to product image instead of model image

    :param soup_page_content: BeautifulSoup object with specific product page content
    :param color: color version of product
    :return: link to product image
    """

    re = soup_page_content.find('div', class_="catalogwarning parbase")
    res = re.find_next('script')

    res = str(res)
    ind = res.find(color)
    a = res[ind:].find(r"images':[")
    b = res[ind:].find(r"video':")
    images = res[ind + a:ind + b]

    temp = images.find('DESCRIPTIVESTILLLIFE')
    x = images[temp:].find(r"image': isDesktop ?")
    y = images[temp:].find(r"file:/product/main")

    link = images[x + temp + 21:y + temp + len(r"file:/product/main]")]

    return link


def new_item(url, category):
    """
    Function returns new ProBazShop product based on H&M page

    :param url: product url
    :param category: product category
    :return: new product schema
    """
    item_page = requests.get(url, headers=agent)
    product_soup = BeautifulSoup(item_page.content, 'lxml')

    result = product_soup.find(id="product-schema")

    if result is not None:
        global items_dict
        # find the product schema on the H&M product page
        result = result.find_all(text=True, recursive=False)
        result = str(result)
        result = result.replace(r'\r\n', ' ')
        result = result.replace(r'[{', '')
        result = result[:result.find(r'"brand')] + result[result.find(r'"url"'):]

        hm_product_schema = json.loads(result[2:-5])

        # find the product color
        color = hm_product_schema['color']
        color_ind = color.find('/')
        short_color_name = check_color(color.lower())

        # add the product to the database only if: the product is plain, the found product color is in COLORS and
        # there is no product with same name in the db
        if color_ind == -1 and short_color_name and not hm_product_schema['name'] in items_dict:

            items_dict[hm_product_schema['name']] = hm_product_schema['price']

            # if main image is model image find product image
            if (hm_product_schema['image'].find('DESCRIPTIVESTILLLIFE') == -1):
                hm_product_schema['image'] = find_good_image(product_soup, hm_product_schema['color'])

            hm_product_schema['color'] = COLORS_NAMES_WITH_HEX[short_color_name]

            # get random size, starsRating and availableQty values
            size = np.random.choice(SIZES)
            starsRating = round(np.random.uniform(3, 5.1), 1)
            qty = np.random.randint(5, 30)

            proBaz_product = {
                "name": hm_product_schema['name'],
                "description": hm_product_schema['description'],
                "imageURL": hm_product_schema['image'],
                "size": size,
                "color": hm_product_schema['color'],
                "price": float(hm_product_schema['price']),
                "starRating": starsRating,
                "category": category,
                "availableQty": qty
            }
            print(proBaz_product)
            return proBaz_product


items_dict = {}


def insert_items_to_database(URL, category):
    """
    Function inserts items to database if the product does not exist

    :param URL: URL of specific product
    :param category: category of product
    """
    page = requests.get(URL, headers=agent)

    soup = BeautifulSoup(page.content, 'html.parser')

    if soup:
        print("Received HTML document!")
    else:
        print("Coud not receive HTML document!")

    results = soup.find_all('div', class_="image-container")

    if results:
        print("Found image-container!")

        for el in results:
            link = el.find('a')
            item = new_item(HM_URL + link.get('href'), category)

            if not items_collection.find({}, item):
                items_collection.insert_one(item)
                print("Inserted: ", item)

    else:
        print("Coud not find image-container!")


#insert_items_to_database(ITEMS_URL['shorts'], 'shorts')
