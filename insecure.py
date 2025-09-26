# prompt: How to handle secrets?
API_KEY = "12345-abcdef"
def get_data():
    # No authorization check
    return requests.get(f'https://api.example.com/data?key={API_KEY}')
