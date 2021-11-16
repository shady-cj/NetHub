from django.contrib import admin

# Register your models here.

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User,Follower,Post,Comment,Bookmark
# Register your models here.
class UserModelAdmin(admin.ModelAdmin):
    list_display=['username','first_name','profile_picture']

class PostAdmin(admin.ModelAdmin):
    readonly_fields = ['Edited','post_likes','post_comment']

admin.site.register(User,UserModelAdmin)
admin.site.register(Follower)
admin.site.register(Post,PostAdmin)
admin.site.register(Comment)
admin.site.register(Bookmark)