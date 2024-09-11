from rest_framework import serializers
from rest_framework.renderers import JSONRenderer

from dialti.models import Products


class ProductsSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Products
        fields = "__all__"




